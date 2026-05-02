// frontend/src/components/ui/ImageGallery.jsx
import { useState } from 'react';
import './ImageGallery.css';

const ImageGallery = ({ images, productName, thumbnailPosition = 'bottom' }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const imageList = images?.length > 0 ? images : ['/images/placeholder.jpg'];

  const handleThumbnailClick = (index) => {
    setSelectedIndex(index);
  };

  const handleMainImageClick = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div className={`image-gallery gallery-${thumbnailPosition}`}>
      {/* تصویر اصلی */}
      <div 
        className={`gallery-main ${isZoomed ? 'zoomed' : ''}`}
        onClick={handleMainImageClick}
      >
        <img 
          src={imageList[selectedIndex]} 
          alt={`${productName} - ${selectedIndex + 1}`}
        />
        <div className="zoom-icon">🔍</div>
      </div>

      {/* تصاویر کوچک */}
      {imageList.length > 1 && (
        <div className="gallery-thumbnails">
          {imageList.map((img, index) => (
            <div
              key={index}
              className={`thumbnail ${selectedIndex === index ? 'active' : ''}`}
              onClick={() => handleThumbnailClick(index)}
            >
              <img src={img} alt={`تصویر ${index + 1}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
