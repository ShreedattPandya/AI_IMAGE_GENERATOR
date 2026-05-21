import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyImages, deleteImage } from "../api";
import { useAuth } from "../context/AuthContext";
import ExploreCard from "../components/ExploreCard";
import ImageModal from "../components/ImageModal";

export default function ProfilePage() {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadMyImages();
  }, []);

  const loadMyImages = async () => {
    try {
      setLoading(true);
      const data = await fetchMyImages();
      setImages(data.images);
    } catch (err) {
      setError("Failed to load your images.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this image? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteImage(id);
      setImages(prev => prev.filter(img => img._id !== id));
      if (selectedImage && selectedImage._id === id) {
        setSelectedImage(null);
      }
    } catch (err) {
      alert("Failed to delete image: " + err.message);
    }
  };

  const totalLikes = images.reduce((acc, img) => acc + (img.likeCount || 0), 0);
  const totalDownloads = images.reduce((acc, img) => acc + (img.downloads || 0), 0);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar large">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h2>{user.name}</h2>
          <p className="text-muted">{user.email}</p>
          
          <div className="profile-stats">
            <div className="stat-box">
              <span className="stat-value">{images.length}</span>
              <span className="stat-label">Creations</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{totalLikes}</span>
              <span className="stat-label">Total Likes</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{totalDownloads}</span>
              <span className="stat-label">Downloads</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <h3>My Creations</h3>
        {error && <div className="error-box">{error}</div>}
        
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : images.length > 0 ? (
          <div className="masonry-grid">
            {images.map(img => (
              <div key={img._id} className="profile-card-wrapper">
                <ExploreCard image={img} onClick={setSelectedImage} />
                <button 
                  className="btn-danger delete-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(img._id);
                  }}
                  title="Delete Image"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>You haven't created any images yet.</p>
            <Link to="/create" className="btn-primary mt-3 inline-block" style={{ display: "inline-flex", width: "auto", padding: "0.75rem 2rem" }}>
              Start Creating
            </Link>
          </div>
        )}
      </div>

      {selectedImage && (
        <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
}
