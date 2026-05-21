import { useEffect, useState } from "react";
import { likeImage, trackDownload } from "../api";
import { useAuth } from "../context/AuthContext";

export default function ImageModal({ image, onClose }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(image.likedByMe);
  const [likeCount, setLikeCount] = useState(image.likeCount);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleLike = async () => {
    if (!user) {
      alert("Please log in to like images.");
      return;
    }
    try {
      const data = await likeImage(image._id);
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async () => {
    try {
      await trackDownload(image._id);
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `ai-img-${image._id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(image.imageUrl);
    alert("Image URL copied to clipboard!");
  };

  const p = image.parameters;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        <div className="modal-grid">
          <div className="modal-img-container">
            <img src={image.imageUrl} alt={image.prompt} />
          </div>
          <div className="modal-sidebar">
            <div className="creator-info">
              <div className="avatar">{image.creatorName.charAt(0).toUpperCase()}</div>
              <div>
                <div className="creator-name">{image.creatorName}</div>
                <div className="created-date">{new Date(image.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            
            <div className="prompt-section">
              <h3>Prompt</h3>
              <p className="full-prompt">{image.prompt}</p>
            </div>

            {image.negative_prompt && (
              <div className="prompt-section">
                <h3>Negative Prompt</h3>
                <p className="full-prompt">{image.negative_prompt}</p>
              </div>
            )}

            <div className="generation-details">
              <h3>Generation Details</h3>
              <div className="tags">
                <span className="tag">Model: {image.model}</span>
                <span className="tag">Steps: {p.num_inference_steps}</span>
                <span className="tag">CFG: {p.guidance_scale}</span>
                <span className="tag">{p.width}×{p.height}</span>
                {p.seed ? <span className="tag">Seed: {p.seed}</span> : null}
                {p.scheduler ? <span className="tag">Scheduler: {p.scheduler}</span> : null}
              </div>
            </div>

            <div className="modal-actions">
              <button className={`btn-primary ${liked ? "liked" : ""}`} onClick={handleLike}>
                {liked ? "❤️ Liked" : "🤍 Like"} ({likeCount})
              </button>
              <button className="btn-secondary" onClick={handleDownload}>
                ⬇ Download
              </button>
              <button className="btn-secondary" onClick={handleCopyUrl}>
                🔗 Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
