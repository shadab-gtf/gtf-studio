import Link from "next/link";
import {
  ArrowRight,
  Check,
  CloudOff,
  Download,
  Layers,
  Sparkles,
} from "@/components/ui/icons";
import { Brand } from "@/components/ui/brand";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { StudioDemoVideo } from "@/components/ui/studio-demo-video";
import { HeroMarquee } from "@/components/ui/hero-marquee";
import { InstallButton } from "@/features/pwa/install-prompt";
import { DocumentPreview } from "@/core/renderer/document-preview";
import { TemplateArtwork } from "@/components/ui/template-artwork";
import { featuredTemplates } from "@/lib/utils/featured-templates";
import type { Format, StudioCatalog, Template } from "@/types/studio";

/** Soft background tones for the Explore grid, cycled across cards so no two neighbours share a colour. */
const EXPLORE_TONES = ["pink", "yellow", "blue"] as const;

/** Maps a format onto the template category whose preview best represents it. */
const FORMAT_CATEGORY: Record<string, Template["category"]> = {
  social: "Social",
  "social-portrait": "Portrait post",
  presentation: "Presentation",
  "slides-classic": "Presentation",
  story: "Story",
  poster: "Poster",
  banner: "Banner",
  youtube: "Video thumbnail",
  linkedin: "Banner",
  logo: "Logo",
  resume: "Resume",
  a4: "Resume",
  letter: "Resume",
  invitation: "Invitation",
  flyer: "Flyer",
  "business-card": "Business card",
};

export function LandingSection({ catalog }: { catalog: StudioCatalog }) {
  const featured = featuredTemplates(catalog.templates);
  const presentation =
    featured.find((template) => template.category === "Presentation") ??
    catalog.templates.find((template) => template.category === "Presentation")!;
  const exploreFormats = catalog.formats.slice(0, 12);
  const templateByCategory = new Map<Template["category"], Template>();
  for (const template of catalog.templates) {
    if (!templateByCategory.has(template.category)) {
      templateByCategory.set(template.category, template);
    }
  }
  const previewFor = (format: Format, index: number): Template =>
    templateByCategory.get(FORMAT_CATEGORY[format.id]) ??
    catalog.templates[index % catalog.templates.length];
  return (
    <div className="marketing-page">
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
        <section className="hero" aria-labelledby="hero-heading">
          <HeroMarquee templates={catalog.templates} />
          <div className="hero-copy">
            <h1 id="hero-heading">
              A little idea.
              <br />A world of possibilities.
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
                Start creating <ArrowRight size={19} aria-hidden="true" />
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
                <Check size={15} aria-hidden="true" />
                No sign-up needed
              </span>
              <span>
                <Check size={15} aria-hidden="true" />
                Your work, saved locally
              </span>
            </div>
          </div>
        </section>
        <section
          className="explore-formats section-container"
          aria-labelledby="explore-heading"
        >
          <div className="section-heading">
            <div>
              <h2 id="explore-heading">Explore templates</h2>
              <p>Pick a format and make it yours — no blank canvas required.</p>
            </div>
            <Link href="/templates" className="text-link">
              See all templates <ArrowRight size={18} />
            </Link>
          </div>
          <div className="explore-grid">
            {exploreFormats.map((format, index) => {
              const preview = previewFor(format, index);
              return (
                <Link
                  key={format.id}
                  href={`/dashboard?format=${format.id}`}
                  className={`explore-card explore-card--${EXPLORE_TONES[index % EXPLORE_TONES.length]}`}
                >
                  <span className="explore-card-info">
                    <span className="explore-card-title">{format.title}</span>
                  </span>
                  <span className="explore-card-art" aria-hidden="true">
                    <DocumentPreview
                      document={preview.document}
                      page={preview.document.pages[0]}
                      label={`${format.title} template`}
                    />
                  </span>
                </Link>
              );
            })}
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
            <StudioDemoVideo />
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
        <section
          className="template-showcase section-container"
          id="template-showcase"
        >
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
            {featured.map((template) => (
              <Link
                href={`/templates?template=${template.id}`}
                className="landing-template"
                key={template.id}
              >
                <div
                  className={`landing-template-art template-art--${template.id}`}
                >
                  <TemplateArtwork
                    template={template}
                    sizes="(max-width: 767px) 45vw, 23vw"
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
            <Link
              href={`/templates?template=${presentation.id}`}
              className="mini-presentation"
              aria-label={`Use ${presentation.title} template`}
            >
              <TemplateArtwork
                template={presentation}
                sizes="(max-width: 767px) 85vw, 44vw"
              />
            </Link>
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
    </div>
  );
}
