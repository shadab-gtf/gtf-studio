import type { CreativeDocument } from "@/core/document/schema";
import type { FontService } from "./font-service";
import type {
  Asset,
  BrandKit,
  CreateProjectInput,
  PaginatedResult,
  Project,
  ProjectQuery,
  ProjectSummary,
} from "@/types/studio";

export interface ProjectService {
  list(
    query?: ProjectQuery,
    signal?: AbortSignal,
  ): Promise<PaginatedResult<ProjectSummary>>;
  get(id: string, signal?: AbortSignal): Promise<Project>;
  create(input: CreateProjectInput): Promise<Project>;
  update(
    id: string,
    input: Partial<Pick<Project, "title" | "status">>,
  ): Promise<Project>;
  duplicate(id: string): Promise<Project>;
  delete(id: string): Promise<void>;
}
export interface DocumentService {
  save(
    id: string,
    document: CreativeDocument,
    expectedRevision: number,
  ): Promise<Project>;
  revisions(id: string): Promise<Project[]>;
}
export interface AssetService {
  list(): Promise<Asset[]>;
  save(asset: Asset): Promise<void>;
  delete(id: string): Promise<void>;
}
export interface BrandKitService {
  list(): Promise<BrandKit[]>;
  save(kit: BrandKit): Promise<void>;
  delete(id: string): Promise<void>;
}
export interface StudioServices {
  resetWorkspace(): Promise<void>;
  projects: ProjectService;
  documents: DocumentService;
  assets: AssetService;
  brandKits: BrandKitService;
  fonts: FontService;
}
