import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Circle,
  CloudOff,
  Download,
  Layers,
  Play,
  Plus,
  Redo2,
  SlidersHorizontal,
  Sparkles,
  Square,
  Type,
  Undo2,
} from "@/components/ui/icons";
import { Brand } from "@/components/ui/brand";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { InstallButton } from "@/features/pwa/install-prompt";
import { DocumentPreview } from "@/core/renderer/document-preview";
import type { StudioCatalog } from "@/types/studio";

type HeroTile = { bg: string; h: number };

/**
 * Three Pinterest-style columns of colourful placeholder tiles that scroll up / down / up. For now the tiles are
 * warm and cold gradients; swap each `bg` for an image later. Purely decorative, so the marquee is aria-hidden.
 */
const HERO_COLUMNS: { dir: "up" | "down"; dur: number; tiles: HeroTile[] }[] = [
  {
    dir: "up",
    dur: 42,
    tiles: [
      { bg: "linear-gradient(135deg, #ff7a59, #ff3d77)", h: 190 },
      { bg: "linear-gradient(135deg, #5b8def, #8b5cf6)", h: 150 },
      { bg: "linear-gradient(135deg, #34d399, #22d3ee)", h: 214 },
      { bg: "linear-gradient(135deg, #ffb648, #ff6a3d)", h: 158 },
      { bg: "linear-gradient(135deg, #f472b6, #db2777)", h: 182 },
    ],
  },
  {
    dir: "down",
    dur: 34,
    tiles: [
      { bg: "linear-gradient(135deg, #4f9dff, #2bc2e4)", h: 164 },
      { bg: "linear-gradient(135deg, #ff6286, #d6457d)", h: 204 },
      { bg: "linear-gradient(135deg, #a78bfa, #7c3aed)", h: 150 },
      { bg: "linear-gradient(135deg, #ffd152, #ff8a3d)", h: 192 },
      { bg: "linear-gradient(135deg, #2dd4bf, #3b82f6)", h: 170 },
    ],
  },
  {
    dir: "up",
    dur: 48,
    tiles: [
      { bg: "linear-gradient(135deg, #fb7185, #e11d48)", h: 172 },
      { bg: "linear-gradient(135deg, #38bdf8, #6366f1)", h: 204 },
      { bg: "linear-gradient(135deg, #fca5a5, #f97316)", h: 150 },
      { bg: "linear-gradient(135deg, #818cf8, #a855f7)", h: 190 },
      { bg: "linear-gradient(135deg, #f59e0b, #ef4444)", h: 160 },
    ],
  },
];

function HeroMarquee() {
  return (
    <div className="hero-stream" aria-hidden="true">
      {HERO_COLUMNS.map((col, c) => (
        <div
          key={c}
          className={`hero-col hero-col--${col.dir}`}
          style={{ animationDuration: `${col.dur}s` }}
        >
          {[...col.tiles, ...col.tiles].map((tile, i) => (
            <span
              key={i}
              className="hero-tile"
              style={{ background: tile.bg, height: tile.h }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function LandingSection({ catalog }: { catalog: StudioCatalog }) {
  const [bloom, waves, sunday, ordinary, perspective] = catalog.templates;
  return (
    <>
      <header className="marketing-header">
        <div className="marketing-nav">
          <Brand />
          <nav aria-label="Main navigation">
            <Link href="/dashboard">Design studio</Link>
            <Link href="/templates">Templates</Link>
            <a href="#how-it-works">How it works</a>
          </nav>
          <div className="nav-actions">
            <ThemeToggle />
            <Link className="button button--primary" href="/login">
              Open studio <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>
      <main id="main">
        <section className="hero section-container">
          <div className="hero-copy">
            <h1>
              A little idea.
              <br />A world of{" "}
              <br />
              possibilities.
            </h1>
            <p>
              Big ideas, everyday designs, and everything in between. Bring it
              all to life in your own creative space.
            </p>
            <div className="hero-actions">
              <Link
                href="/login"
                className="button button--primary button--large"
              >
                Start creating <ArrowRight size={19} />
              </Link>
              <Link
                href="/templates"
                className="button button--secondary button--large"
              >
                Explore templates
              </Link>
            </div>
            <div className="hero-reassurance">
              <span>
                <Check size={15} />
                No sign-up needed
              </span>
              <span>
                <Check size={15} />
                Your work, saved locally
              </span>
            </div>
          </div>
          <HeroMarquee />
        </section>
        <section
          className="format-strip section-container"
          aria-label="What you can create"
        >
          <span>A canvas for whatever’s next.</span>
          <div>
            {catalog.formats.slice(0, 5).map((format, index) => (
              <Link key={format.id} href={`/dashboard?format=${format.id}`}>
                {index === 0 ? (
                  <Square size={18} />
                ) : index === 1 ? (
                  <Play size={18} />
                ) : index === 2 ? (
                  <Layers size={18} />
                ) : index === 3 ? (
                  <Type size={18} />
                ) : (
                  <SlidersHorizontal size={18} />
                )}
                {format.title}
                <ChevronRight size={14} />
              </Link>
            ))}
          </div>
        </section>
        <section className="studio-story" id="how-it-works">
          <div className="section-container">
            <div className="section-heading">
              <div>
                <h2>
                  Less figuring it out.
                  <br />
                  More making it yours.
                </h2>
                <p>
                  Everything you need to go from “what if” to “look at this.”
                </p>
              </div>
              <Link href="/dashboard" className="text-link">
                Meet your studio <ArrowRight size={18} />
              </Link>
            </div>
            <Link
              href="/dashboard"
              className="studio-demo"
              aria-label="Open the design studio"
            >
              <div className="demo-header">
                <span className="demo-logo">
                  <span className="brand-dot">
                    <Sparkles size={14} />
                  </span>
                  GTF Studio
                </span>
                <span>My next big idea</span>
                <span className="demo-save">
                  <Check size={13} />
                  Saved on this device
                </span>
                <span className="demo-export">
                  Export <Download size={13} />
                </span>
              </div>
              <div className="demo-body">
                <div className="demo-rail">
                  {[Layers, Type, Square, Circle].map((Icon, index) => (
                    <span key={index}>
                      <Icon size={19} />
                      {["Design", "Text", "Shapes", "Brand"][index]}
                    </span>
                  ))}
                </div>
                <div className="demo-library">
                  <strong>Make a little magic.</strong>
                  <span className="demo-search">Find your starting point</span>
                  <div className="demo-template-grid">
                    {catalog.templates.slice(0, 4).map((template) => (
                      <DocumentPreview
                        key={template.id}
                        document={template.document}
                        page={template.document.pages[0]}
                      />
                    ))}
                  </div>
                  <span className="demo-add">
                    <Plus size={15} />
                    Add your own touch
                  </span>
                </div>
                <div className="demo-stage">
                  <div className="demo-toolbar">
                    <Undo2 size={15} />
                    <Redo2 size={15} />
                    <span>Manrope</span>
                    <strong>B</strong>
                    <span className="color-dot pink" />
                  </div>
                  <div className="demo-canvas">
                    <DocumentPreview
                      document={ordinary.document}
                      page={ordinary.document.pages[0]}
                    />
                  </div>
                  <div className="demo-footer">
                    Page 1 of 1<span>70%</span>
                  </div>
                </div>
                <div className="demo-properties">
                  <strong>Your finishing touches</strong>
                  <span>Position</span>
                  <div className="demo-inputs">
                    <span>X&nbsp; 75</span>
                    <span>Y&nbsp; 180</span>
                  </div>
                  <span>Color palette</span>
                  <div className="demo-swatches">
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                  <span>Layers</span>
                  <div className="demo-layer">
                    <Type size={14} />A little less ordinary.
                  </div>
                  <div className="demo-layer">
                    <Circle size={14} />
                    Circle
                  </div>
                </div>
              </div>
            </Link>
            <div className="feature-notes">
              <div>
                <Layers size={23} />
                <h3>A head start, every time.</h3>
                <p>
                  Pick a template, change a few things, and make it completely
                  your own.
                </p>
              </div>
              <div>
                <CloudOff size={23} />
                <h3>Your ideas stay with you.</h3>
                <p>
                  Automatic saving on this device keeps your work ready for your
                  next visit.
                </p>
              </div>
              <div>
                <Download size={23} />
                <h3>Ready for the real world.</h3>
                <p>
                  Export your designs as images, PDFs, or editable PowerPoint
                  presentations.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="template-showcase section-container">
          <div className="section-heading">
            <div>
              <h2>Skip the blank canvas.</h2>
              <p>
                A few good starting points. Endless ways to make them yours.
              </p>
            </div>
            <Link href="/templates" className="text-link">
              Find your inspiration <ArrowRight size={18} />
            </Link>
          </div>
          <div className="landing-templates">
            {[bloom, sunday, perspective, waves].map((template) => (
              <Link
                href={`/templates?template=${template.id}`}
                className="landing-template"
                key={template.id}
              >
                <div
                  className={`landing-template-art template-art--${template.id}`}
                >
                  <DocumentPreview
                    document={template.document}
                    page={template.document.pages[0]}
                  />
                </div>
                <div>
                  <h3>{template.title}</h3>
                  <span>{template.category}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <section className="local-story section-container">
          <div className="local-story-art">
            <div className="mini-presentation">
              <DocumentPreview
                document={perspective.document}
                page={perspective.document.pages[0]}
              />
            </div>
            <div className="local-save-note">
              <Check size={18} />
              <div>
                <strong>A little peace of mind.</strong>
                <span>Saved on this device.</span>
              </div>
            </div>
          </div>
          <div>
            <h2>
              Your creative space.
              <br />
              On your terms.
            </h2>
            <p>
              Open your studio wherever inspiration finds you. Work on desktop,
              tablet, or phone. No accounts, no subscriptions, just room to
              create.
            </p>
            <p className="local-honesty">
              Projects stay in this browser. Download a project backup to move
              your work to another device or keep an extra copy.
            </p>
            <InstallButton />
          </div>
        </section>
        <section className="final-cta">
          <Sparkles size={30} />
          <h2>
            That idea you’ve been thinking about?
            <br />
            Let’s make it happen.
          </h2>
          <Link href="/dashboard" className="button button--ink button--large">
            Find your creative space <ArrowRight size={18} />
          </Link>
          <p>No sign-up. Just your imagination.</p>
        </section>
      </main>
      <footer className="marketing-footer section-container">
        <Brand />
        <span>A little more room to create.</span>
        <div>
          <Link href="/templates">Templates</Link>
          <Link href="/settings">Your data</Link>
          <Link href="/font-licenses">Font licenses</Link>
          <a href="#how-it-works">How it works</a>
        </div>
        <p>© {new Date().getFullYear()} GTF Studio</p>
      </footer>
    </>
  );
}
