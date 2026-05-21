import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GallerySection from "../components/GallerySection";
import { LANDING_IMAGES } from "../landingAssets";

const FEATURES = [
  {
    title: "Lightning-Fast Results",
    desc: "Generate high-quality images in seconds with optimized FLUX and SDXL pipelines. No waiting, just creating.",
    image: LANDING_IMAGES.featureSpeed,
    reverse: false,
  },
  {
    title: "Total Creative Control",
    desc: "Fine-tune steps, guidance scale, dimensions, seeds, and negative prompts. Every parameter at your fingertips.",
    image: LANDING_IMAGES.featureControl,
    reverse: true,
  },
  {
    title: "Effortless Refinement",
    desc: "Iterate on prompts, revisit your generation history, and evolve ideas from a single concept into a full series.",
    image: LANDING_IMAGES.featureRefine,
    reverse: false,
  },
  {
    title: "Professional Quality Output",
    desc: "Export up to 1280px resolution with crisp detail. Share to the community gallery or download for your projects.",
    image: LANDING_IMAGES.featureQuality,
    reverse: true,
  },
];

const MODEL_GROUPS = [
  {
    icon: "△",
    name: "FLUX",
    models: ["FLUX.1 Schnell", "FLUX.1 Dev", "FLUX 1.1 Pro"],
  },
  {
    icon: "✦",
    name: "Stable Diffusion",
    models: ["SDXL 1.0", "SDXL Turbo", "SD 2.1"],
  },
  {
    icon: "◎",
    name: "Community",
    models: ["Shared Gallery", "Likes & Downloads", "Public Profiles"],
  },
  {
    icon: "◇",
    name: "Coming Soon",
    models: ["DALL·E 3", "Ideogram 2.0", "Midjourney-style"],
  },
];

const PARTNERS = ["FLUX", "Replicate", "SDXL", "MongoDB", "React"];

export default function HomePage() {
  const [heroPrompt, setHeroPrompt] = useState("");
  const navigate = useNavigate();

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    const q = heroPrompt.trim();
    navigate(q ? `/create?prompt=${encodeURIComponent(q)}` : "/create");
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-overlay" aria-hidden="true" />

        <div className="hero-content">
          <h1 className="hero-title">
            The Fastest Way to
            <br />
            Create Beautiful AI Art
          </h1>
          <p className="hero-subtitle">
            Turn imagination into stunning visuals in seconds. Join thousands of creators
            sharing their work in our community gallery.
          </p>

          <Link to="/signup" className="btn-hero">
            Start Creating Free
          </Link>
          <span className="hero-caption">No credit card required</span>

          <form className="hero-prompt-bar" onSubmit={handleHeroSubmit}>
            <span className="hero-prompt-spark" aria-hidden="true">
              ✦
            </span>
            <input
              type="text"
              aria-label="Prompt"
              placeholder="Your prompt here…"
              value={heroPrompt}
              onChange={(e) => setHeroPrompt(e.target.value)}
            />
            <button type="submit" className="hero-prompt-go" aria-label="Generate">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          <div className="hero-partners">
            {PARTNERS.map((name) => (
              <span key={name} className="partner-badge">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="section-inner">
          <div className="section-header section-header--center">
            <span className="section-eyebrow">Capabilities</span>
            <h2 className="section-title">What Makes It Special</h2>
          </div>

          <div className="features-list">
            {FEATURES.map((f) => (
              <article
                key={f.title}
                className={`feature-row ${f.reverse ? "feature-row--reverse" : ""}`}
              >
                <div className="feature-text">
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <Link to="/create" className="btn-text">
                    Start creating →
                  </Link>
                </div>
                <div className="feature-image-wrap">
                  <img src={f.image} alt="" loading="lazy" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="models" className="models-section">
        <div className="section-inner">
          <div className="section-header section-header--center">
            <span className="section-eyebrow">Technology</span>
            <h2 className="section-title">Powered by Advanced AI Models</h2>
            <p className="section-desc">
              Choose from the latest and most powerful models to bring your vision to life.
            </p>
          </div>

          <div className="models-grid">
            {MODEL_GROUPS.map((group) => (
              <div key={group.name} className="model-card">
                <div className="model-icon">{group.icon}</div>
                <h4>{group.name}</h4>
                <ul>
                  {group.models.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GallerySection />

      <footer className="site-footer">
        <div className="section-inner footer-inner">
          <div className="footer-brand">
            <img src="/assets/mainLogo.gif" alt="" className="footer-logo" />
            <span>Gem AI</span>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} — Create. Share. Inspire.</p>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#gallery">Gallery</a>
            <Link to="/create">Create</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
