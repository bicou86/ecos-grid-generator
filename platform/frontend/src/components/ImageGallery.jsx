import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';

export default function ImageGallery({ images, type = 'cases' }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!images || images.length === 0) {
    return null;
  }

  const openLightbox = (index) => {
    setSelectedIndex(index);
    setZoomLevel(1);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
    setZoomLevel(1);
    document.body.style.overflow = 'auto'; // Restore scrolling
  };

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setZoomLevel(1);
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = (filename) => {
    const link = document.createElement('a');
    link.href = `/images/${type}/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleKeyDown = (e) => {
    if (selectedIndex === null) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
        break;
      default:
        break;
    }
  };

  // Add keyboard event listener
  useState(() => {
    if (selectedIndex !== null) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedIndex]);

  return (
    <div className="my-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Images médicales ({images.length})
        </h3>
      </div>

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="group relative cursor-pointer overflow-hidden rounded-lg bg-gray-100 shadow-md hover:shadow-xl transition-all duration-200"
            onClick={() => openLightbox(index)}
          >
            {/* Thumbnail Image */}
            <div className="aspect-w-4 aspect-h-3 relative">
              <img
                src={`/images/${type}/${image.filename}`}
                alt={image.description || 'Image médicale'}
                className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-110"
                loading="lazy"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
            </div>

            {/* Image Caption */}
            <div className="p-3 bg-white">
              <p className="text-sm text-gray-700 line-clamp-2" title={image.description}>
                {image.description || `Image ${index + 1}`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-colors z-10"
            aria-label="Fermer"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-colors z-10"
                aria-label="Image précédente"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-colors z-10"
                aria-label="Image suivante"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Zoom Controls */}
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              className="p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-colors"
              aria-label="Zoom arrière"
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOut className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              className="p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-colors"
              aria-label="Zoom avant"
              disabled={zoomLevel >= 3}
            >
              <ZoomIn className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(images[selectedIndex].filename);
              }}
              className="p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-colors"
              aria-label="Télécharger"
            >
              <Download className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Image Container */}
          <div
            className="relative max-w-7xl max-h-full overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`/images/${type}/${images[selectedIndex].filename}`}
              alt={images[selectedIndex].description || 'Image médicale'}
              className="max-w-full max-h-[85vh] object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            />
          </div>

          {/* Image Info Footer */}
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 p-4 text-white">
            <div className="max-w-7xl mx-auto">
              <p className="text-center text-lg mb-2">
                {images[selectedIndex].description || `Image ${selectedIndex + 1}`}
              </p>
              <p className="text-center text-sm text-gray-300">
                Image {selectedIndex + 1} sur {images.length}
              </p>
            </div>
          </div>

          {/* Keyboard Hints */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-50">
            <span className="hidden md:inline">
              Utilisez ← → pour naviguer • ESC pour fermer
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
