export default function ImageCard({ item, onCopyUrl }) {
  const { parameters: p } = item;

  return (
    <div className="image-card">
      <img src={item.imageUrl} alt={item.prompt} loading="lazy" />
      <div className="meta">
        <div className="prompt-text">&ldquo;{item.prompt}&rdquo;</div>
        <div className="tags">
          <span className="tag">Model: {item.model}</span>
          <span className="tag">Steps: {p.num_inference_steps}</span>
          <span className="tag">CFG: {p.guidance_scale}</span>
          <span className="tag">
            {p.width}×{p.height}
          </span>
          {p.seed ? <span className="tag">Seed: {p.seed}</span> : null}
        </div>
        <div className="actions">
          <a
            className="btn-sm"
            href={item.imageUrl}
            download="ai-image.png"
            target="_blank"
            rel="noopener noreferrer"
          >
            ⬇ Download
          </a>
          <button type="button" className="btn-sm" onClick={() => onCopyUrl(item.imageUrl)}>
            🔗 Copy URL
          </button>
        </div>
      </div>
    </div>
  );
}
