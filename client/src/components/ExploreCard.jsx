import { useState } from "react";
import { likeImage, trackDownload } from "../api";
import { useAuth } from "../context/AuthContext";

export default function ExploreCard({ image, onClick }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(image.likedByMe);
  const [likeCount, setLikeCount] = useState(image.likeCount);

  const handleLike = async (e) => {
    e.stopPropagation();
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

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      await trackDownload(image._id);
      // Trigger actual download
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

  return (
    <div className="explore-card" onClick={() => onClick(image)}>
      <img src={image.imageUrl} alt={image.prompt} loading="lazy" />
      <div className="explore-overlay">
        <div className="overlay-top">
          <div className="creator-badge">
            <span className="avatar-mini">{image.creatorName.charAt(0).toUpperCase()}</span>
            <span>{image.creatorName}</span>
          </div>
        </div>
        <div className="overlay-bottom">
          <p className="prompt-snippet">{image.prompt}</p>
          <div className="actions">
            <button className={`action-btn ${liked ? "liked" : ""}`} onClick={handleLike}>
              {liked ? "❤️" : "🤍"} {likeCount}
            </button>
            <button className="action-btn" onClick={handleDownload}>
              ⬇️ {image.downloads || 0}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
