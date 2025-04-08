import React, { useState, useRef, useEffect } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';

const ImagePositionEditor = ({ 
  imageUrl, 
  onSave, 
  onCancel, 
  aspectRatio = 1, // Default to square
  initialPosition = { x: 50, y: 50 } // Default to center (values are percentages)
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  
  // Handle mouse/touch down
  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
  };
  
  // Handle mouse/touch move
  const handleDragMove = (e) => {
    if (!isDragging || !containerRef.current || !imageRef.current) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    
    // Calculate the new position percentages
    const newX = Math.max(0, Math.min(100, position.x - (deltaX / containerWidth) * 100));
    const newY = Math.max(0, Math.min(100, position.y - (deltaY / containerHeight) * 100));
    
    setPosition({ x: newX, y: newY });
    setDragStart({ x: clientX, y: clientY });
  };
  
  // Handle mouse/touch up
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove);
      document.addEventListener('touchend', handleDragEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, position, dragStart]);
  
  const handleSave = () => {
    onSave(position);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden max-w-3xl w-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Adjust Image Position
          </h3>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-4 flex flex-col gap-4">
          <div 
            ref={containerRef}
            className="relative w-full overflow-hidden cursor-move"
            style={{ 
              height: aspectRatio !== 1 ? '240px' : '300px',
              borderRadius: aspectRatio !== 1 ? '0.5rem' : '50%',
            }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            {imageUrl && (
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Adjust position"
                className="absolute w-full h-full object-cover select-none"
                style={{
                  objectPosition: `${position.x}% ${position.y}%`,
                  userSelect: 'none',
                  touchAction: 'none',
                }}
                draggable="false"
              />
            )}
            <div className="absolute inset-0 border-2 border-white border-dashed pointer-events-none"></div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Horizontal Position: {Math.round(position.x)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={position.x}
              onChange={(e) => setPosition({ ...position, x: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Vertical Position: {Math.round(position.y)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={position.y}
              onChange={(e) => setPosition({ ...position, y: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drag the image to position it, or use the sliders to fine-tune.
          </p>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 flex items-center"
          >
            <FaSave className="mr-2" /> Save Position
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImagePositionEditor;
