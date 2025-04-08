// src/components/common/ImageModal.jsx
import React, { useState, useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ImageModal = ({ imageUrl, onClose, allImages = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  // If imageUrl is provided directly, use it, otherwise use allImages array
  const images = allImages.length > 0 ? allImages : [imageUrl];
  
  // Set the current index based on the imageUrl if allImages is provided
  useEffect(() => {
    if (allImages.length > 0 && imageUrl) {
      const index = allImages.findIndex(img => img === imageUrl);
      if (index >= 0) {
        setCurrentIndex(index);
      }
    }
  }, [imageUrl, allImages]);
  
  // Prevent closing when clicking on the image itself
  const handleImageClick = (e) => {
    e.stopPropagation();
  };
  
  // Handle navigation to previous image
  const handlePrevious = (e) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };
  
  // Handle navigation to next image
  const handleNext = (e) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious(e);
      } else if (e.key === 'ArrowRight') {
        handleNext(e);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length]);
  
  // Handle touch events for swipe gesture
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100) {
      // Swipe left, go to next image
      handleNext({ stopPropagation: () => {} });
    } else if (touchStart - touchEnd < -100) {
      // Swipe right, go to previous image
      handlePrevious({ stopPropagation: () => {} });
    }
    // Reset values
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full">
        <button
          className="absolute top-4 right-4 bg-white rounded-full p-2 text-gray-800 hover:bg-gray-100 z-10"
          onClick={onClose}
        >
          <FaTimes />
        </button>
        
        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 text-gray-800 hover:bg-gray-100 z-10"
              onClick={handlePrevious}
            >
              <FaChevronLeft />
            </button>
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 text-gray-800 hover:bg-gray-100 z-10"
              onClick={handleNext}
            >
              <FaChevronRight />
            </button>
          </>
        )}
        
        {/* Image */}
        <img 
          src={images[currentIndex]} 
          alt="Full size" 
          className="max-h-[90vh] max-w-full mx-auto object-contain rounded-lg"
          onClick={handleImageClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        
        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageModal;
