/**
 * Image utilities for Church Connect
 * 
 * This module provides functions for image processing,
 * including resizing, compression, and format conversion.
 */

/**
 * Resize and compress an image file before upload
 * 
 * @param {File} file - The original image file
 * @param {Object} options - Resize options
 * @param {number} options.maxWidth - Maximum width of the resized image (default: 800)
 * @param {number} options.maxHeight - Maximum height of the resized image (default: 800)
 * @param {number} options.quality - JPEG quality from 0 to 1 (default: 0.7)
 * @param {string} options.format - Output format: 'jpeg', 'png', or 'auto' (default: 'jpeg')
 * @param {boolean} options.preserveExif - Whether to preserve EXIF data (default: false)
 * @param {Function} options.onProgress - Progress callback function (default: null)
 * @returns {Promise<File>} A promise that resolves to the resized image file
 */
export const resizeImage = async (file, options = {}) => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.7,
    format = 'jpeg',
    preserveExif = false,
    onProgress = null,
    forceResize = false
  } = options;

  // Skip resizing if it's not an image
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Skip small files (less than 500KB) unless forced
  if (file.size < 500 * 1024 && !forceResize) {
    return file;
  }

  // Update progress
  if (onProgress) onProgress(0.1);

  return new Promise((resolve, reject) => {
    // Create a FileReader to read the file
    const reader = new FileReader();

    reader.onload = (event) => {
      // Update progress
      if (onProgress) onProgress(0.3);

      // Create an image to load the file data
      const img = new Image();

      img.onload = () => {
        // Update progress
        if (onProgress) onProgress(0.5);

        // Calculate new dimensions while maintaining aspect ratio
        let newWidth = img.width;
        let newHeight = img.height;

        if (newWidth > maxWidth) {
          newHeight = (newHeight * maxWidth) / newWidth;
          newWidth = maxWidth;
        }

        if (newHeight > maxHeight) {
          newWidth = (newWidth * maxHeight) / newHeight;
          newHeight = maxHeight;
        }

        // Round dimensions to integers
        newWidth = Math.round(newWidth);
        newHeight = Math.round(newHeight);

        // Create a canvas for the resized image
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw the image on the canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Update progress
        if (onProgress) onProgress(0.8);

        // Determine the output format
        let outputFormat = format;
        if (outputFormat === 'auto') {
          // Use the same format as the input file
          if (file.type === 'image/png') {
            outputFormat = 'png';
          } else {
            outputFormat = 'jpeg';
          }
        }

        // Convert the canvas to a Blob
        canvas.toBlob(
          (blob) => {
            // Update progress
            if (onProgress) onProgress(0.9);

            // Create a new File from the Blob
            const resizedFile = new File(
              [blob],
              file.name,
              {
                type: `image/${outputFormat}`,
                lastModified: Date.now(),
              }
            );

            // Update progress
            if (onProgress) onProgress(1);

            resolve(resizedFile);
          },
          `image/${outputFormat}`,
          quality
        );
      };

      img.onerror = (error) => {
        reject(new Error(`Error loading image: ${error.message}`));
      };

      // Load the image from the FileReader result
      img.src = event.target.result;
    };

    reader.onerror = (error) => {
      reject(new Error(`Error reading file: ${error.message}`));
    };

    // Read the file as a data URL
    reader.readAsDataURL(file);
  });
};

/**
 * Aggressively resize an image to ensure it's under a specified size limit
 * This is used as a fallback for very large images
 * 
 * @param {File} file - The image file to resize
 * @param {number} maxSizeKB - Maximum size in KB (default: 1800)
 * @returns {Promise<File>} A promise that resolves to the resized image file
 */
export const aggressivelyResizeImage = async (file, maxSizeKB = 1800) => {
  // First attempt - moderate compression
  let quality = 0.7;
  let maxWidth = 800;
  let maxHeight = 800;
  
  let resizedFile = await resizeImage(file, {
    maxWidth, 
    maxHeight,
    quality,
    format: 'jpeg',
    forceResize: true
  });
  
  // If still too large, try with lower quality
  if (resizedFile.size > maxSizeKB * 1024) {
    console.log('First resize attempt still too large, trying with lower quality...');
    quality = 0.5;
    resizedFile = await resizeImage(file, {
      maxWidth, 
      maxHeight,
      quality,
      format: 'jpeg',
      forceResize: true
    });
  }
  
  // If still too large, reduce dimensions further
  if (resizedFile.size > maxSizeKB * 1024) {
    console.log('Second resize attempt still too large, reducing dimensions...');
    maxWidth = 600;
    maxHeight = 600;
    quality = 0.5;
    resizedFile = await resizeImage(file, {
      maxWidth,
      maxHeight,
      quality,
      format: 'jpeg',
      forceResize: true
    });
  }
  
  // Last resort - tiny image but it will upload
  if (resizedFile.size > maxSizeKB * 1024) {
    console.log('Third resize attempt still too large, using minimal settings...');
    maxWidth = 400;
    maxHeight = 400;
    quality = 0.4;
    resizedFile = await resizeImage(file, {
      maxWidth,
      maxHeight,
      quality,
      format: 'jpeg',
      forceResize: true
    });
  }
  
  return resizedFile;
};

/**
 * Resize multiple images in a batch
 * 
 * @param {File[]} files - Array of image files
 * @param {Object} options - Resize options (same as resizeImage)
 * @param {Function} onProgress - Overall progress callback (0-1)
 * @returns {Promise<File[]>} A promise that resolves to an array of resized image files
 */
export const resizeImages = async (files, options = {}, onProgress = null) => {
  const resizedFiles = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Calculate individual and overall progress
    const fileProgress = (progress) => {
      if (onProgress) {
        const overallProgress = (i + progress) / files.length;
        onProgress(overallProgress);
      }
    };
    
    // Resize this file with progress tracking
    const resizedFile = await resizeImage(file, {
      ...options,
      onProgress: fileProgress
    });
    
    resizedFiles.push(resizedFile);
  }
  
  return resizedFiles;
};

/**
 * Calculates the appropriate resize options based on the upload type
 * 
 * @param {string} uploadType - Type of upload ('avatar', 'cover', 'post', 'logo')
 * @returns {Object} Resize options for the specified upload type
 */
export const getResizeOptionsForType = (uploadType) => {
  switch (uploadType) {
    case 'avatar':
      return {
        maxWidth: 300,         // Reduced from 400
        maxHeight: 300,        // Reduced from 400
        quality: 0.7,          // Reduced from 0.85
        format: 'jpeg',
        forceResize: true
      };
    
    case 'cover':
      return {
        maxWidth: 1200,        // Reduced from 1500
        maxHeight: 400,        // Reduced from 500
        quality: 0.7,          // Reduced from 0.8
        format: 'jpeg',
        forceResize: true
      };
    
    case 'post':
      return {
        maxWidth: 800,         // Reduced from 1200
        maxHeight: 800,        // Reduced from 1200
        quality: 0.7,          // Reduced from 0.8
        format: 'jpeg',
        forceResize: true
      };
    
    case 'logo':
      return {
        maxWidth: 300,         // Reduced from 500
        maxHeight: 300,        // Reduced from 500
        quality: 0.8,          // Reduced from 0.9
        format: 'png',
        forceResize: true
      };
    
    default:
      return {
        maxWidth: 800,         // Reduced from 1200
        maxHeight: 800,        // Reduced from 1200
        quality: 0.7,          // Reduced from 0.8
        format: 'jpeg',
        forceResize: true
      };
  }
};

/**
 * Checks if an image file is within the size limits
 * 
 * @param {File} file - The image file to check
 * @param {number} maxSizeBytes - Maximum file size in bytes (default: 2MB)
 * @returns {boolean} True if the file is within size limits, false otherwise
 */
export const isImageWithinSizeLimit = (file, maxSizeBytes = 2 * 1024 * 1024) => {
  return file.size <= maxSizeBytes;
};

/**
 * Uploads an image to Supabase Storage after resizing
 * 
 * @param {File} file - The image file to upload
 * @param {Object} options - Upload options
 * @param {string} options.bucket - Storage bucket name
 * @param {string} options.path - Path within the bucket
 * @param {string} options.uploadType - Type of upload for resizing ('avatar', 'cover', 'post', 'logo')
 * @param {Function} options.onProgress - Progress callback function
 * @param {Function} options.supabase - Supabase client instance
 * @returns {Promise<{path: string, url: string}>} Path and URL of the uploaded file
 */
export const uploadResizedImage = async (file, options) => {
  const {
    bucket,
    path,
    uploadType = 'post',
    onProgress,
    supabase
  } = options;

  // Skip if not an image
  if (!file.type.startsWith('image/')) {
    throw new Error('File is not an image');
  }

  // Function to report progress
  const progressCallback = onProgress || (() => {});
  
  try {
    // Step 1: Resize the image (0-50% of progress)
    progressCallback(0.1);
    const resizeOptions = getResizeOptionsForType(uploadType);
    
    // Create a sub-progress function for the resize operation
    const resizeProgress = (progress) => {
      progressCallback(progress * 0.5); // 0 to 0.5 (50%)
    };
    
    let resizedFile = await resizeImage(file, {
      ...resizeOptions,
      onProgress: resizeProgress
    });
    
    // If still too large after initial resize, use aggressive resizing
    if (resizedFile.size > 1.9 * 1024 * 1024) {
      progressCallback(0.5);
      console.log(`File still too large after initial resize (${resizedFile.size} bytes). Using aggressive resize.`);
      resizedFile = await aggressivelyResizeImage(file, 1800);
    }
    
    progressCallback(0.5); // Resize complete
    
    // Step 2: Upload to Supabase (50-100% of progress)
    const filePath = `${path}/${Date.now()}-${resizedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, resizedFile, {
        cacheControl: '3600',
        upsert: true,
        onUploadProgress: (progress) => {
          const uploadProgress = 0.5 + (progress.percent || 0) * 0.5;
          progressCallback(uploadProgress);
        }
      });
    
    if (error) {
      throw error;
    }
    
    progressCallback(1); // Upload complete
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return {
      path: filePath,
      url: publicUrl,
      size: resizedFile.size
    };
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

/**
 * Format a file size in bytes to a human-readable string
 * 
 * @param {number} bytes - File size in bytes
 * @returns {string} Human-readable file size
 */
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};
