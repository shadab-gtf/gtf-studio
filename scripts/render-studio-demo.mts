import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp, { type Sharp } from "sharp";

interface Capture {
  name: string;
  file: string;
  point: [number, number];
}
interface Cue {
  time: number;
  name: string;
  click: boolean;
}
interface Camera {
  time: number;
  zoom: number;
  x: number;
  y: number;
}
const root = process.cwd();
const work = path.join(root, "artifacts/casual-demo");
const out = path.join(root, "public/media/demo");
const fps = 60;
const duration = 20;
const width = 1920;
const height = 1080;
const stage = { left: 244, top: 20, width: 1432, height: 1040 };
const sourceSize = { width: 1053, height: 764 };
const revealAt = 17.5;
const captures = JSON.parse(
  await readFile(path.join(work, "source/shots.json"), "utf8"),
) as Capture[];
const captureByName = new Map(
  captures.map((capture) => [capture.name, capture]),
);
const cues: Cue[] = [];
const cue = (time: number, name: string, click = false): void => {
  cues.push({ time, name, click });
};
cue(0, "01-blank");
cue(0.65, "02-background", true);
cue(1.15, "03-ivory", true);
cue(1.65, "04-images", true);
cue(2.2, "05-photo-added", true);
cue(2.7, "06-before-drag");
for (let i = 1; i <= 8; i++)
  cue(2.85 + i * 0.1, `07-drag-${String(i).padStart(2, "0")}`);
for (let i = 1; i <= 6; i++)
  cue(3.95 + i * 0.125, `08-resize-${String(i).padStart(2, "0")}`);
cue(5.1, "09-photo-composed");
cue(5.7, "10-text-panel", true);
cue(6.25, "11-headline", true);
cue(7.1, "12-title-styled");
cue(7.85, "13-details");
cue(8.6, "14-composition");
cue(9.3, "15-animate", true);
cue(10, "16-page-rise", true);
cue(10.8, "17-audio", true);
cue(11.55, "18-music-added", true);
cue(12.15, "18-audio-close", true);
cue(12.6, "19-timeline", true);
cue(13.3, "20-export-menu", true);
cue(13.9, "21-export-dialog", true);
cue(14.5, "22-mp4-settings", true);
cue(14.8, "22-frame-rate", true);
cue(15.1, "22-quality", true);
cue(15.6, "23-rendering", true);
cue(16.4, "24-export-ready", true);

const cameras: Camera[] = [
  { time: 0, zoom: 1, x: 526.5, y: 382 },
  { time: 2.7, zoom: 1, x: 526.5, y: 382 },
  { time: 3.5, zoom: 1.11, x: 565, y: 405 },
  { time: 5.1, zoom: 1.11, x: 565, y: 405 },
  { time: 5.7, zoom: 1, x: 526.5, y: 382 },
  { time: 7.1, zoom: 1.08, x: 566, y: 360 },
  { time: 8.65, zoom: 1.08, x: 566, y: 360 },
  { time: 9.3, zoom: 1, x: 526.5, y: 382 },
  { time: revealAt, zoom: 1, x: 526.5, y: 382 },
];
const ease = (t: number): number => {
  const x = Math.max(0, Math.min(1, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
};
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
function cameraAt(time: number): Camera {
  const next = cameras.findIndex((camera) => camera.time > time);
  if (next < 0) return cameras[cameras.length - 1];
  if (next === 0) return cameras[0];
  const a = cameras[next - 1];
  const b = cameras[next];
  const p = ease((time - a.time) / (b.time - a.time));
  return {
    time,
    zoom: lerp(a.zoom, b.zoom, p),
    x: lerp(a.x, b.x, p),
    y: lerp(a.y, b.y, p),
  };
}
const svg = (content: string, w = width, h = height): Buffer =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${content}</svg>`,
  );
await mkdir(out, { recursive: true });
const sourceCache = new Map<string, Buffer>();
for (const item of cues) {
  const capture = captureByName.get(item.name);
  if (!capture) throw new Error(`Missing editor capture: ${item.name}`);
  if (!sourceCache.has(item.name))
    sourceCache.set(item.name, await sharp(capture.file).png().toBuffer());
}
function cropFor(camera: Camera) {
  const w = sourceSize.width / camera.zoom;
  const h = sourceSize.height / camera.zoom;
  return {
    left: Math.max(0, Math.min(sourceSize.width - w, camera.x - w / 2)),
    top: Math.max(0, Math.min(sourceSize.height - h, camera.y - h / 2)),
    width: w,
    height: h,
  };
}
function pointerAt(time: number, index: number): [number, number] {
  const current = captureByName.get(cues[index].name)!.point;
  const next = cues[index + 1];
  if (!next) return current;
  const destination = captureByName.get(next.name)!.point;
  const dragging = /^(07-drag|08-resize)/.test(next.name);
  const start = dragging
    ? cues[index].time
    : Math.max(cues[index].time + 0.02, next.time - 0.65);
  const progress = Math.max(
    0,
    Math.min(1, (time - start) / Math.max(0.001, next.time - start)),
  );
  const p = dragging ? progress : ease(progress);
  return [
    lerp(current[0], destination[0], p),
    lerp(current[1], destination[1], p) -
      (dragging ? 0 : Math.sin(p * Math.PI) * 12),
  ];
}
function cursorSvg(
  time: number,
  index: number,
  crop: ReturnType<typeof cropFor>,
): Buffer {
  const [px, py] = pointerAt(time, index);
  const x = stage.left + ((px - crop.left) * stage.width) / crop.width;
  const y = stage.top + ((py - crop.top) * stage.height) / crop.height;
  const age = time - cues[index].time;
  const clicking = cues[index].click && age < 0.42;
  const ring = clicking
    ? `<circle cx="${x}" cy="${y}" r="${8 + age * 70}" stroke="#bf2173" stroke-width="3" fill="#e24397" fill-opacity="${0.16 * (1 - age / 0.42)}" stroke-opacity="${1 - age / 0.42}"/>`
    : "";
  return svg(
    `${ring}<g transform="translate(${x} ${y}) scale(${clicking ? 1 - 0.12 * Math.sin((age / 0.42) * Math.PI) : 1})"><path d="M2 2L4 38L13 29L21 45L29 41L21 26L34 25Z" fill="#17212b" stroke="white" stroke-width="3.5" stroke-linejoin="round"/></g>`,
  );
}

async function ffmpeg(args: string[]): Promise<void> {
  const process = spawn(
    "ffmpeg",
    ["-y", "-hide_banner", "-loglevel", "error", ...args],
    { stdio: "inherit" },
  );
  const [code] = await once(process, "close");
  if (code !== 0) throw new Error(`FFmpeg exited ${String(code)}`);
}

interface MotionClip {
  start: number;
  duration: number;
  folder: string;
}
const motionClips: MotionClip[] = [];
async function prepareMotion(
  name: string,
  start: number,
  duration: number,
  names: string[],
): Promise<void> {
  const folder = path.join(work, name);
  await mkdir(folder, { recursive: true });
  const padded = [
    names[0],
    ...names,
    names[names.length - 1],
    names[names.length - 1],
  ];
  for (let i = 0; i < padded.length; i++)
    await sharp(captureByName.get(padded[i])!.file)
      .png()
      .toFile(path.join(folder, `input-${String(i).padStart(3, "0")}.png`));
  const rate = (names.length - 1) / duration;
  await ffmpeg([
    "-framerate",
    String(rate),
    "-i",
    path.join(folder, "input-%03d.png"),
    "-vf",
    `minterpolate=fps=${fps}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,trim=start=${1 / rate}:duration=${duration},setpts=PTS-STARTPTS`,
    "-frames:v",
    String(Math.floor(duration * fps)),
    path.join(folder, "frame-%03d.png"),
  ]);
  motionClips.push({ start, duration, folder });
}

// Fractional source transforms avoid the one-pixel camera judder caused by rounded crops.
function imageLayer(
  input: Buffer,
  crop: ReturnType<typeof cropFor>,
  opacity = 1,
): string {
  const scaleX = stage.width / crop.width;
  const scaleY = stage.height / crop.height;
  return `<image href="data:image/png;base64,${input.toString("base64")}" x="${stage.left - crop.left * scaleX}" y="${stage.top - crop.top * scaleY}" width="${sourceSize.width * scaleX}" height="${sourceSize.height * scaleY}" opacity="${opacity}"/>`;
}

async function editorFrame(time: number, pointer = true): Promise<Sharp> {
  const index = Math.max(
    0,
    cues.findLastIndex((item) => item.time <= time),
  );
  const crop = cropFor(cameraAt(time));
  const motion = motionClips.find(
    (clip) => time >= clip.start && time < clip.start + clip.duration,
  );
  let input = sourceCache.get(cues[index].name)!;
  if (motion) {
    const frame = Math.min(
      Math.floor(motion.duration * fps),
      1 + Math.floor((time - motion.start) * fps),
    );
    input = await readFile(
      path.join(motion.folder, `frame-${String(frame).padStart(3, "0")}.png`),
    );
  }
  const age = time - cues[index].time;
  const moving = /^(07-drag|08-resize)/.test(cues[index].name);
  const dissolve = Math.min(
    0.18,
    (cues[index].time - (cues[index - 1]?.time ?? -1)) * 0.45,
  );
  const layers =
    !motion && !moving && index > 0 && age < dissolve
      ? imageLayer(sourceCache.get(cues[index - 1].name)!, crop) +
        imageLayer(input, crop, ease(age / dissolve))
      : imageLayer(input, crop);
  const picture = sharp(
    svg(
      `<rect width="${width}" height="${height}" fill="#f5f6fa"/><defs><clipPath id="editor"><rect x="${stage.left}" y="${stage.top}" width="${stage.width}" height="${stage.height}" rx="12"/></clipPath></defs><g clip-path="url(#editor)">${layers}</g>`,
    ),
  );
  if (pointer)
    picture.composite([
      { input: cursorSvg(time, index, crop), left: 0, top: 0 },
    ]);
  return picture;
}

async function finalFrame(time: number): Promise<Sharp> {
  const progress = ease((time - revealAt) / (duration - revealAt));
  const h = 976 + 40 * progress;
  const w = (h * 1728) / 2428;
  const frame = Math.min(150, 1 + Math.floor((time - revealAt) * fps));
  const picture = await readFile(
    path.join(work, "reveal-v2", `frame-${String(frame).padStart(3, "0")}.png`),
  );
  return sharp(
    svg(
      `<rect width="${width}" height="${height}" fill="#f5f6fa"/><defs><filter id="shadow" x="-30%" y="-30%" width="160%" height="180%"><feGaussianBlur stdDeviation="18"/></filter></defs><rect x="${(width - w) / 2}" y="${(height - h) / 2 + 14}" width="${w}" height="${h}" fill="#17212b" opacity=".12" filter="url(#shadow)"/><image href="data:image/png;base64,${picture.toString("base64")}" x="${(width - w) / 2}" y="${(height - h) / 2}" width="${w}" height="${h}"/>`,
    ),
  );
}

const silentFile = path.join(work, "walkthrough-silent.mp4");
if (!process.argv.includes("--audio-only")) {
  if (process.argv.includes("--reuse-motion")) {
    motionClips.push(
      { start: 2.85, duration: 0.8, folder: path.join(work, "drag-smooth") },
      { start: 3.95, duration: 0.75, folder: path.join(work, "resize-smooth") },
    );
  } else {
    await prepareMotion("drag-smooth", 2.85, 0.8, [
      "06-before-drag",
      ...Array.from(
        { length: 8 },
        (_, i) => `07-drag-${String(i + 1).padStart(2, "0")}`,
      ),
    ]);
    await prepareMotion("resize-smooth", 3.95, 0.75, [
      "07-drag-08",
      ...Array.from(
        { length: 6 },
        (_, i) => `08-resize-${String(i + 1).padStart(2, "0")}`,
      ),
    ]);
    await mkdir(path.join(work, "reveal-v2"), { recursive: true });
    await ffmpeg([
      "-i",
      path.join(work, "template-export.mp4"),
      "-vf",
      "scale=-2:1080,setpts=0.8*PTS,fps=60",
      "-frames:v",
      "150",
      path.join(work, "reveal-v2", "frame-%03d.png"),
    ]);
  }
  const encoder = spawn(
    "ffmpeg",
    [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-f",
      "rawvideo",
      "-pix_fmt",
      "rgb24",
      "-s",
      `${width}x${height}`,
      "-r",
      String(fps),
      "-i",
      "pipe:0",
      "-an",
      "-c:v",
      "libx264",
      "-preset",
      "fast",
      "-crf",
      "19",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      silentFile,
    ],
    { stdio: ["pipe", "ignore", "inherit"] },
  );
  const encodeDone = once(encoder, "close");
  const finalEditor = await (
    await editorFrame(revealAt - 1 / fps, false)
  )
    .png()
    .toBuffer();
  for (let frame = 0; frame < duration * fps; frame++) {
    const time = frame / fps;
    let picture =
      time < revealAt ? await editorFrame(time) : await finalFrame(time);
    if (time >= revealAt && time < revealAt + 0.32) {
      const alpha = ease((time - revealAt) / 0.32);
      const foreground = await picture
        .clone()
        .composite([
          {
            input: svg(
              `<rect width="${width}" height="${height}" fill="white" opacity="${alpha}"/>`,
            ),
            blend: "dest-in",
          },
        ])
        .png()
        .toBuffer();
      picture = sharp(finalEditor).composite([{ input: foreground }]);
    }
    if (frame === 1170)
      await picture
        .clone()
        .webp({ quality: 88 })
        .toFile(path.join(out, "studio-walkthrough-poster.webp"));
    if ([0, 270, 540, 870, 990, 1170].includes(frame))
      await writeFile(
        path.join(work, `v2-proof-${String(frame).padStart(4, "0")}.png`),
        await picture.clone().png().toBuffer(),
      );
    const rgb = await picture.removeAlpha().raw().toBuffer();
    if (!encoder.stdin.write(rgb)) await once(encoder.stdin, "drain");
    if (frame % 120 === 0)
      console.log(`Rendered ${frame / fps}s / ${duration}s`);
  }
  encoder.stdin.end();
  const [code] = await encodeDone;
  if (code !== 0) throw new Error(`Video encoder exited ${String(code)}`);
}

const clicks = cues
  .filter((item) => item.click)
  .map((item) => Math.round(item.time * 1000));
const inputs = [
  "-i",
  silentFile,
  "-i",
  path.join(root, "public/media/audio/music/bright-side.ogg"),
  "-i",
  path.join(root, "public/media/audio/sfx/click-soft.ogg"),
];
const splits = clicks.map((_, i) => `[c${i}]`).join("");
const sound = [
  `[1:a]atrim=0:20,asetpts=PTS-STARTPTS,volume=.8,afade=t=in:d=0.45,afade=t=out:st=18.9:d=1.1[music]`,
  `[2:a]asplit=${clicks.length}${splits}`,
  ...clicks.map((ms, i) => `[c${i}]volume=.32,adelay=${ms}|${ms}[click${i}]`),
  `[music]${clicks.map((_, i) => `[click${i}]`).join("")}amix=inputs=${clicks.length + 1}:duration=first:normalize=0,alimiter=limit=.9[a]`,
].join(";");
const mux = spawn(
  "ffmpeg",
  [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    ...inputs,
    "-filter_complex",
    sound,
    "-map",
    "0:v",
    "-map",
    "[a]",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-b:a",
    "160k",
    "-t",
    "20",
    "-movflags",
    "+faststart",
    path.join(work, "studio-walkthrough-ready.mp4"),
  ],
  { stdio: "inherit" },
);
const [muxCode] = await once(mux, "close");
if (muxCode !== 0) throw new Error(`Audio mix exited ${String(muxCode)}`);
await rename(
  path.join(work, "studio-walkthrough-ready.mp4"),
  path.join(out, "studio-walkthrough.mp4"),
);
await writeFile(
  path.join(work, "edit.json"),
  JSON.stringify({ fps, duration, revealAt, cues, cameras }, null, 2),
);
console.log("Finished public/media/demo/studio-walkthrough.mp4");
