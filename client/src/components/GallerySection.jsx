import { useState, useEffect } from "react";
import { fetchExplore } from "../api";
import SearchBar from "./SearchBar";
import ExploreCard from "./ExploreCard";
import ImageModal from "./ImageModal";

export default function GallerySection({ compact = false }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    model: "",
    sort: "newest",
  });

  const loadImages = async (pageNum, currentFilters, append = false) => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchExplore({ page: pageNum, ...currentFilters });
      setImages((prev) => (append ? [...prev, ...data.images] : data.images));
      setTotalPages(data.pages);
      setPage(data.page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages(1, filters, false);
  }, [filters]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      loadImages(page + 1, filters, true);
    }
  };

  return (
    <section id="gallery" className={`gallery-section ${compact ? "gallery-section--compact" : ""}`}>
      <div className="section-inner">
        <div className="section-header">
          <span className="section-eyebrow">Community</span>
          <h2 className="section-title">Explore the Gallery</h2>
          <p className="section-desc">
            Discover stunning AI art created by our community. Like, download, and get inspired.
          </p>
        </div>

        <SearchBar
          initialSearch={filters.search}
          initialModel={filters.model}
          initialSort={filters.sort}
          onSearch={(newFilters) => setFilters(newFilters)}
        />

        {error && <div className="error-box">{error}</div>}

        <div className="masonry-grid">
          {images.map((img) => (
            <ExploreCard key={img._id} image={img} onClick={setSelectedImage} />
          ))}
        </div>

        {loading && (
          <div className="page-loader">
            <div className="spinner" />
          </div>
        )}

        {!loading && images.length === 0 && (
          <div className="empty-state">
            <h3>No images found</h3>
            <p>Try adjusting your search filters or be the first to create.</p>
          </div>
        )}

        {!loading && page < totalPages && (
          <div className="load-more-container">
            <button type="button" className="btn-outline load-more" onClick={handleLoadMore}>
              Load More
            </button>
          </div>
        )}
      </div>

      {selectedImage && (
        <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </section>
  );
}
