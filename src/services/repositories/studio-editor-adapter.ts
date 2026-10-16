import { templateThumbnail } from "@/features/studio/template-thumbnail";
import { openDB, type DBSchema } from "idb";
import type { StudioServices } from "@/services/contracts/studio-service";
import type { FontFamily as CatalogFont, FontChoice } from "@/services/contracts/font-service";
import type { Project, StudioCatalog } from "@/types/studio";
import type { EditorAdapter } from "@/vendor/doory/types/adapter";
import type { Asset, BrandKit, CommentT, ElementItem, ElementPack, FontFamily, Page, ShareLink, ShareRole, TemplateSummary, VersionSummary } from "@/vendor/doory/types/api";
import type { DoryDocument } from "@/vendor/doory/types/document";
import { ServiceError } from "@/services/errors/service-error";
import { studioDocumentSchema } from "@/core/document/studio-schema";
import { blobDataUrl, toStudioDocument, withStudioDocument } from "@/features/studio/document-bridge";
import { assertImageDimensions } from "@/features/assets/image-limits";
import { deleteProjectAuxiliaryData, EDITOR_DATABASE } from "./storage-cleanup";

interface EditorDB extends DBSchema {
  assets: { key: string; value: { meta: Asset; blob: Blob } };
  brand: { key: string; value: BrandKit };
  comments: { key: string; value: { projectId: string; comment: CommentT }; indexes: { projectId: string } };
  versions: { key: string; value: { projectId: string; summary: VersionSummary; document: DoryDocument }; indexes: { projectId: string } };
}

function paginate<T>(items: T[], query: { page?: number; page_size?: number } = {}): Page<T> {
  const size = Math.max(1, Math.min(100, query.page_size ?? 30));
  const start = (Math.max(1, query.page ?? 1) - 1) * size;
  return { count: items.length, results: items.slice(start, start + size), next: start + size < items.length ? String(start / size + 2) : null, previous: start ? String(start / size) : null };
}

export function createStudioEditorAdapter(project: Project, catalog: StudioCatalog, services: StudioServices) {
  let revision = project.revision;
  let current = toStudioDocument(project.document);
  let readDocument = () => current;
  const previewElement = project.document.pages[0]?.elements.find(e => e.type === "image" && e.name === "Design preview");
  let preview = previewElement?.type === "image" ? previewElement.src : undefined;
  const urls = new Map<string, string>();
  let closed = false;
  const close = () => { closed = true; for (const url of urls.values()) URL.revokeObjectURL(url); urls.clear(); void database.then(db => db.close()); };
  const database = openDB<EditorDB>(EDITOR_DATABASE, 1, { upgrade(db) {
    db.createObjectStore("assets", { keyPath: "meta.id" });
    db.createObjectStore("brand", { keyPath: "id" });
    db.createObjectStore("comments", { keyPath: "comment.id" }).createIndex("projectId", "projectId");
    db.createObjectStore("versions", { keyPath: "summary.id" }).createIndex("projectId", "projectId");
  }, blocking: close });
  const objectUrl = (key: string, blob: Blob) => {
    const existing = urls.get(key); if (existing) return existing;
    if (closed) throw new Error("This editor has closed.");
    const url = URL.createObjectURL(blob); urls.set(key, url); return url;
  };
  const fontChoice = (font: CatalogFont, weight = 400, style = "normal"): FontChoice => ({ id: font.id, family: font.family, weight: [...font.weights].sort((a,b) => Math.abs(a-weight)-Math.abs(b-weight))[0] ?? 400, style: style === "italic" && font.styles.includes("italic") ? "italic" : "normal", subset: font.defSubset });
  const mapFont = (font: CatalogFont): FontFamily => ({
    id: font.id, family: font.family, category: font.category === "serif" || font.category === "display" || font.category === "handwriting" || font.category === "monospace" ? font.category : "sans-serif", scripts: font.subsets, is_variable: false, is_user_font: font.id.startsWith("upload-"), popularity: font.family === "Manrope" ? 1 : 100,
    variants: font.files ?? (font.id.startsWith("upload-") ? [] : font.weights.flatMap(weight => font.styles.map(style => ({ weight, style, url: `https://cdn.jsdelivr.net/fontsource/fonts/${font.id}@latest/${font.defSubset}-${weight}-${style}.woff2` })))),
    load: async (weight, style) => { await services.fonts.load(fontChoice(font, weight, style)); },
    file: async (weight, style) => objectUrl(`font:${font.id}:${weight}:${style}`, await services.fonts.file(fontChoice(font, weight, style))),
  });
  const categoryNames = [...new Set(catalog.templates.map(t => t.category))];
  const summary = (template: StudioCatalog["templates"][number]): TemplateSummary => ({ id: template.id, slug: template.id, title: template.title, category: { id: template.category, slug: template.category, name: template.category }, tags: [template.category], width: template.document.width, height: template.document.height, orientation: template.document.width === template.document.height ? "square" : template.document.width > template.document.height ? "landscape" : "portrait", preset: "", page_count: template.document.pages.length, thumbnail_url: templateThumbnail(template), is_featured: false, use_count: 0, created_at: "2026-10-01T00:00:00.000Z" });
  let elements: Promise<{ packs: ElementPack[]; items: ElementItem[] }> | undefined;
  const elementCatalog = () => elements ??= fetch("/studio-assets/elements.json").then(async r => { if (!r.ok) throw new Error("The element library is unavailable."); return await r.json() as { packs: ElementPack[]; items: ElementItem[] }; }).catch(error => { elements = undefined; throw error; });
  const comments = async () => (await (await database).getAllFromIndex("comments", "projectId", project.id)).map(r => r.comment);
  const writeProjectData = async <T,>(write: () => Promise<T>): Promise<T> => {
    if (closed) throw new Error("This editor has closed.");
    await services.projects.get(project.id);
    const result = await write();
    // Deletion in another tab may finish while this write waits for IndexedDB.
    try { await services.projects.get(project.id); } catch (error) { await deleteProjectAuxiliaryData(project.id); throw error; }
    return result;
  };
  const putComment = async (comment: CommentT) => writeProjectData(async () => { await (await database).put("comments", { projectId: project.id, comment }); return comment; });
  const findComment = async (id: string) => { const record = await (await database).get("comments", id); if (!record || record.projectId !== project.id) throw new Error("This comment was not found."); return record.comment; };
  const resolveSrc = async (src: string) => {
    if (!src.startsWith("idb://")) return src;
    const id = src.slice(6); const found = await (await database).get("assets", id);
    if (!found) throw new Error("A local asset is missing. Upload the file again.");
    return objectUrl(id, found.blob);
  };
  // Frontend-only share links: stored on this device and opened read-only via `?view=1` (no server, so they work in this browser).
  const SHARES_KEY = `gtf:studio:shares:${project.id}`;
  const readShares = (): ShareLink[] => { try { const raw = localStorage.getItem(SHARES_KEY); return raw ? (JSON.parse(raw) as ShareLink[]) : []; } catch { return []; } };
  const writeShares = (links: ShareLink[]) => { try { localStorage.setItem(SHARES_KEY, JSON.stringify(links)); } catch { /* storage may be unavailable */ } };
  const shareUrl = (role: ShareRole, token: string): string => (role === "edit" ? `/editor/${project.id}` : `/editor/${project.id}?view=1&t=${token}`);
  const adapter: EditorAdapter = {
    async save(input) {
      const document = studioDocumentSchema.parse(input.document);
      if (input.thumbnail) preview = await blobDataUrl(input.thumbnail);
      try {
        const saved = await services.documents.save(project.id, withStudioDocument(document, preview), revision);
        revision = saved.revision; current = document;
        if (saved.title !== input.title) await services.projects.update(project.id, { title: input.title });
        return { savedAt: Date.now(), revision };
      } catch (error) {
        if (error instanceof ServiceError && error.code === "CONFLICT") { const conflict = new Error(error.message); conflict.name = "RevisionConflictError"; throw conflict; }
        throw error;
      }
    },
    async requireAccount() { return false; },
    resolveSrc,
    async uploadAsset(file, options) {
      if (file.size > 25 * 1024 * 1024) throw new Error("Choose a file smaller than 25 MB.");
      const audio = file.type.startsWith("audio/");
      if (!audio && !["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif", "image/svg+xml"].includes(file.type)) throw new Error("Choose a supported image or audio file.");
      const id = crypto.randomUUID(), url = objectUrl(id, file);
      let width = 0, height = 0;
      try {
        if (!audio) {
          const size = await new Promise<{width:number;height:number}>((resolve, reject) => { const image = new Image(); image.onload = () => resolve({width:image.naturalWidth,height:image.naturalHeight}); image.onerror = () => reject(new Error("This image could not be decoded.")); image.src = url; });
          assertImageDimensions(size.width, size.height);
          width = size.width; height = size.height;
        }
      } catch (error) { URL.revokeObjectURL(url); urls.delete(id); throw error; }
      const kind = audio ? "audio" : file.type === "image/svg+xml" ? "svg" : "image";
      const name = (options?.name ?? (file instanceof File ? file.name : "Uploaded asset")).slice(0,120);
      const meta: Asset = { id, name, kind, url: `idb://${id}`, thumb_url: audio ? "" : `idb://${id}`, width, height, size: file.size, mime: file.type, tags: [], attribution: null, created_at: new Date().toISOString() };
      try { await (await database).put("assets", { meta, blob: file }); }
      catch (error) { URL.revokeObjectURL(url); urls.delete(id); throw error; }
      return { id, name, kind, url: meta.url, thumbUrl: audio ? "" : url, width, height };
    },
    services: {
      fonts: {
        async list(q) { let list = (await services.fonts.catalog()).map(mapFont).filter(f => (!q.q || f.family.toLowerCase().includes(q.q.toLowerCase())) && (!q.category || f.category === q.category) && (!q.script || f.scripts.includes(q.script))); list = list.sort((a,b) => q.ordering?.includes("family") ? a.family.localeCompare(b.family) : a.popularity-b.popularity || a.family.localeCompare(b.family)); return paginate(list,q); },
        mine: {
          async list() { return (await services.fonts.uploaded()).map(mapFont); },
          async upload(input, options) {
            if (!input.files.length) throw new Error("Choose a font file.");
            if (input.files.length > 1) throw new Error("Upload one font file at a time. Variable fonts can contain multiple styles.");
            options?.signal?.throwIfAborted(); const font = await services.fonts.upload(input.files[0], input.family); options?.onProgress?.(1); return mapFont(font);
          },
          remove: id => services.fonts.remove(id),
        },
      },
      templates: {
        async categories() { return categoryNames.map((name,index) => ({ id:name, slug:name, name, icon:"", template_count:catalog.templates.filter(t=>t.category===name).length, sort_order:index })); },
        async list(q) { return paginate(catalog.templates.map(summary).filter(t => (!q.q || t.title.toLowerCase().includes(q.q.toLowerCase())) && (!q.category || t.category?.id === q.category) && (!q.orientation || q.orientation === t.orientation)),q); },
        async get(slug) { const template = catalog.templates.find(t=>t.id===slug); if (!template) throw new Error("This template is unavailable."); return {...summary(template),description:template.description,document:toStudioDocument(template.document)}; },
      },
      elements: { async packs() { return (await elementCatalog()).packs; }, async list(q) { return paginate((await elementCatalog()).items.filter(e=>(!q.pack || e.pack.slug===q.pack || e.pack.id===q.pack)&&(!q.kind||e.kind===q.kind)&&(!q.style||e.style===q.style)&&(!q.q||`${e.name} ${e.tags.join(" ")}`.toLowerCase().includes(q.q.toLowerCase()))),q); } },
      assets: {
        async list(q) { const stored = (await (await database).getAll("assets")).map(r=>r.meta); const basic = (await services.assets.list()).map(a=>({id:a.id,name:a.name,kind:"image" as const,url:a.src,thumb_url:a.src,width:a.width,height:a.height,size:0,mime:"image/png",tags:[],attribution:null,created_at:a.createdAt})); const rows=[...stored,...basic].filter(a=>(!q.kind||q.kind===a.kind)&&(!q.q||a.name.toLowerCase().includes(q.q.toLowerCase()))); return paginate(await Promise.all(rows.map(async a=>({...a,thumb_url:a.kind==="audio"?"":await resolveSrc(a.thumb_url)}))),q); },
        async remove(id) { await (await database).delete("assets",id); await services.assets.delete(id); },
      },
      brand: { async list() { const advanced=await (await database).getAll("brand"); const basic=(await services.brandKits.list()).map(kit=>({id:kit.id,name:kit.name,is_default:kit.id==="gtf",colors:kit.colors.map((hex,i)=>({id:`${kit.id}-${i}`,name:`Color ${i+1}`,hex})),fonts:[{role:"heading" as const,family:kit.font}],logos:[],created_at:project.createdAt,updated_at:project.updatedAt})); return [...advanced,...basic.filter(k=>!advanced.some(a=>a.id===k.id))]; }, async save(kit) { const saved={...kit,id:kit.id||crypto.randomUUID(),updated_at:new Date().toISOString()}; await (await database).put("brand",saved); return saved; } },
      comments: {
        list: comments,
        async create(input) { const body=input.body.trim(); if(!body || body.length>10000) throw new Error("Enter a comment of up to 10,000 characters."); return putComment({id:crypto.randomUUID(),body,author:{id:"local",name:"You (this device)",avatar_url:null},page_id:input.page_id??null,x:input.x??null,y:input.y??null,parent:input.parent??null,resolved:false,created_at:new Date().toISOString()}); },
        async resolve(id,resolved) { return putComment({...await findComment(id),resolved}); },
        async move(id,to) { return putComment({...await findComment(id),...to}); },
        async remove(id) { await findComment(id); const db=await database; for(const comment of await comments())if(comment.id===id||comment.parent===id)await db.delete("comments",comment.id); },
        async viewer() { return {id:"local",owner:true}; },
      },
      versions: {
        async list() { return (await (await database).getAllFromIndex("versions","projectId",project.id)).map(v=>v.summary).sort((a,b)=>b.created_at.localeCompare(a.created_at)); },
        async create(label) { return writeProjectData(async () => { const document=studioDocumentSchema.parse(structuredClone(readDocument())); const summary:VersionSummary={id:crypto.randomUUID(),label:label.slice(0,120),is_auto:false,page_count:document.pages.length,thumbnail_url:preview??null,created_at:new Date().toISOString()}; await (await database).put("versions",{projectId:project.id,summary,document}); return summary; }); },
        async restore(id) { const record=await (await database).get("versions",id); if(!record||record.projectId!==project.id)throw new Error("This version is unavailable."); return studioDocumentSchema.parse(record.document); },
      },
      stock:null,
      sharing: {
        async list() { return readShares(); },
        async create(input) {
          const token = crypto.randomUUID().replace(/-/g, "");
          const link: ShareLink = { id: crypto.randomUUID(), token, role: input.role, url: shareUrl(input.role, token), is_active: true, expires_at: input.expires_at ?? null, has_password: !!input.password, created_at: new Date().toISOString() };
          writeShares([link, ...readShares()]);
          return link;
        },
        async update(id, patch) {
          const links = readShares();
          const index = links.findIndex(l => l.id === id);
          if (index < 0) throw new Error("This share link was not found.");
          const current = links[index];
          const role = patch.role ?? current.role;
          const next: ShareLink = {
            ...current,
            role,
            url: patch.role ? shareUrl(role, current.token) : current.url,
            is_active: patch.is_active ?? current.is_active,
            expires_at: patch.expires_at !== undefined ? patch.expires_at : current.expires_at,
            has_password: patch.password !== undefined ? patch.password !== null : current.has_password,
          };
          links[index] = next; writeShares(links); return next;
        },
        async revoke(id) { writeShares(readShares().filter(l => l.id !== id)); },
      },
    },
    realtime:null,
  };
  return { adapter, bindDocument(getter:()=>DoryDocument) {readDocument=getter;}, dispose: close };
}
