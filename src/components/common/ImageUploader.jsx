import React, { useState } from 'react';
import { 
  resizeImage, 
  getResizeOptionsForType, 
  aggressivelyResizeImage,
  formatFileSize 
} from '../../utils/imageUtils';
import { supabase } from '../../lib/supabase';

/**
 * Reusable image uploader component with preview and resizing
 */
const ImageUploader = ({
  onUploadComplete,
  onUploadError,
  uploadType = 'post',
  bucketName = 'media',
  storagePath,
  maxSizeMB = 2,
  showPreview = true,
  previewSize = 'md',
  acceptedFileTypes = 'image/*',
  buttonText = 'Upload Image',
  className = '',
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [resizedFile, setResizedFile] = useState(null);
  const [processingStep, setProcessingStep] = useState(null);

  // Preview size classes
  const previewSizes = {
    sm: 'h-24 w-24',
    md: 'h-32 w-32',
    lg: 'h-40 w-40',
    xl: 'h-48 w-48'
  };

  // Handle file selection
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);
    setProcessingStep("Reading file");
    
    try {
      // Check file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      
      // Show preview of original file
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(selectedFile);
      
      // File is too large, resize it
      if (selectedFile.size > maxSizeBytes) {
        console.log(`File size ${selectedFile.size} bytes (${formatFileSize(selectedFile.size)}) exceeds limit of ${maxSizeBytes} bytes (${maxSizeMB}MB). Resizing...`);
        
        setProcessingStep("Resizing image");
        
        // First try normal resizing
        const resizeOptions = getResizeOptionsForType(uploadType);
        let processedFile = await resizeImage(selectedFile, {
          ...resizeOptions,
          onProgress: (progress) => {
            setUploadProgress(progress * 0.4); // First 40% of progress is resize
          }
        });
        
        // If still too large, try aggressive resizing
        if (processedFile.size > maxSizeBytes) {
          setProcessingStep("Image still too large, applying aggressive compression");
          setUploadProgress(0.4);
          processedFile = await aggressivelyResizeImage(selectedFile, maxSizeMB * 1000 * 0.9);
        }
        
        setResizedFile(processedFile);
        console.log(`Resized from ${formatFileSize(selectedFile.size)} to ${formatFileSize(processedFile.size)}`);
        
        // Upload the resized file
        await uploadFile(processedFile);
      } else {
        // File is within size limits, upload directly
        await uploadFile(selectedFile);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      
      // More descriptive error message
      let errorMessage = error.message || 'Failed to process image. Please try again.';
      
      // Check for common errors
      if (errorMessage.includes('413') || error.statusCode === 413) {
        errorMessage = `Image is still too large after resizing. Maximum size is ${maxSizeMB}MB. Please try a smaller image or lower quality.`;
      }
      
      setError(`Upload failed: ${errorMessage}`);
      setIsUploading(false);
      if (onUploadError) onUploadError(error);
    }
  };

  // Upload file to Supabase Storage
  const uploadFile = async (fileToUpload) => {
    try {
      setProcessingStep("Uploading to server");
      
      // Generate a unique file path with safe filename
      const safeFileName = fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${storagePath}/${Date.now()}-${safeFileName}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: true,
          onUploadProgress: (progress) => {
            // Last 60% of progress is the actual upload
            const totalProgress = 0.4 + (progress.percent / 100) * 0.6;
            setUploadProgress(totalProgress);
          }
        });
      
      if (error) {
        // Enhanced error handling
        console.error('Supabase upload error:', error);
        
        if (error.statusCode === 413) {
          throw new Error(`File exceeds Supabase size limit of ${maxSizeMB}MB even after compression. Try a smaller image.`);
        }
        
        throw error;
      }
      
      // Get the public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      // Complete the upload
      setIsUploading(false);
      setUploadProgress(1);
      setProcessingStep("Upload complete");
      
      // Call the completion callback
      if (onUploadComplete) {
        onUploadComplete({
          path: filePath,
          url: publicUrl,
          originalSize: file ? file.size : null,
          finalSize: fileToUpload.size
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // More specific error handling
      let errorMessage = error.message || 'Failed to upload image';
      
      if (error.statusCode === 413) {
        errorMessage = `Image is too large. Maximum size is ${maxSizeMB}MB.`;
      } else if (error.message && error.message.includes('permission')) {
        errorMessage = 'Permission denied. You may not have access to upload to this location.';
      }
      
      setError(`Upload failed: ${errorMessage}`);
      setIsUploading(false);
      setProcessingStep(null);
      if (onUploadError) onUploadError(error);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Preview area */}
      {showPreview && previewUrl && (
        <div className={`mb-3 overflow-hidden rounded-lg ${previewSizes[previewSize] || previewSizes.md}`}>
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="object-cover w-full h-full"
          />
        </div>
      )}
      
      {/* Upload progress */}
      {isUploading && (
        <div className="w-full h-2 mb-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${uploadProgress * 100}%` }}
          ></div>
        </div>
      )}
      
      {/* Processing step indicator */}
      {isUploading && processingStep && (
        <p className="text-xs text-gray-500 mb-2">
          {processingStep} ({Math.round(uploadProgress * 100)}%)
        </p>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-3 text-sm text-red-500 p-2 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}
      
      {/* File size information */}
      {!error && file && (
        <div className="mt-2 mb-2 text-xs text-gray-500">
          Original size: {formatFileSize(file.size)}
          {resizedFile && ` → Resized: ${formatFileSize(resizedFile.size)}`}
        </div>
      )}
      
      {/* File input */}
      <label className={`
        inline-flex items-center justify-center px-4 py-2 border border-transparent
        text-sm font-medium rounded-md shadow-sm
        ${disabled || isUploading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        transition-colors duration-200
        ${isUploading ? 'animate-pulse' : ''}
      `}>
        {isUploading ? 'Uploading...' : buttonText}
        <input
          type="file"
          className="hidden"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />
      </label>
      
      {/* Size limit information */}
      <p className="mt-2 text-xs text-gray-500">
        Maximum file size: {maxSizeMB}MB. Larger images will be automatically resized.
      </p>
    </div>
  );
};

export default ImageUploader;
