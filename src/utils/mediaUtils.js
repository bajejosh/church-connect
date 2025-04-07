// src/utils/mediaUtils.js
/**
 * Utility functions for handling media embeds (YouTube, Suno, etc.)
 */

/**
 * Extract YouTube video ID from various YouTube URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - YouTube video ID or null if not a valid YouTube URL
 */
export const getYouTubeVideoId = (url) => {
  if (!url) return null;
  
  // Handle different YouTube URL formats
  const regexPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*v=)([^&?\/\s]+)/,
    /youtube\.com\/shorts\/([^&?\/\s]+)/,
    /youtu\.be\/([^&?\/\s]+)/
  ];
  
  for (const regex of regexPatterns) {
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Extract Suno song ID from Suno URL
 * @param {string} url - Suno URL
 * @returns {string|null} - Suno song ID or null if not a valid Suno URL
 */
export const getSunoSongId = (url) => {
  if (!url) return null;
  
  // Handle Suno URL format
  const regex = /suno\.com\/song\/([^?\/\s]+)/;
  const match = url.match(regex);
  
  if (match && match[1]) {
    return match[1];
  }
  
  // If that doesn't match, try to get the sh parameter from URL
  try {
    const urlObj = new URL(url);
    if (url.includes('suno.com') && urlObj.searchParams.get('sh')) {
      return urlObj.searchParams.get('sh');
    }
  } catch (e) {
    // Ignore URL parsing errors
  }
  
  return null;
};

/**
 * Check if a string is a valid URL
 * @param {string} text - Text to check
 * @returns {boolean} - True if the text is a valid URL
 */
export const isValidUrl = (text) => {
  try {
    new URL(text);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Determine media type from URL
 * @param {string} url - URL to check
 * @returns {string} - Media type ('youtube', 'suno', 'url', or 'text')
 */
export const getMediaType = (url) => {
  if (!url) return 'text';
  
  if (!isValidUrl(url)) return 'text';
  
  if (getYouTubeVideoId(url)) return 'youtube';
  
  if (getSunoSongId(url) || url.includes('suno.com')) return 'suno';
  
  return 'url';
};

/**
 * Instead of returning JSX directly, we'll return objects that describe how to render 
 * the components in the component that uses this utility
 */

/**
 * Create YouTube embed data
 * @param {string} videoId - YouTube video ID
 * @returns {Object} - YouTube embed data
 */
export const createYouTubeEmbed = (videoId) => {
  return {
    type: 'youtube',
    videoId,
    src: `https://www.youtube.com/embed/${videoId}`
  };
};

/**
 * Create Suno embed data
 * @param {string} songId - Suno song ID
 * @returns {Object} - Suno embed data
 */
export const createSunoEmbed = (songId) => {
  return {
    type: 'suno',
    songId,
    src: `https://suno.com/player/${songId}`
  };
};

/**
 * Create URL link data
 * @param {string} url - URL to display
 * @returns {Object} - URL link data
 */
export const createUrlLink = (url) => {
  return {
    type: 'url',
    url
  };
};

/**
 * Parse content for media links and return the appropriate data
 * @param {string} content - Content to parse
 * @returns {Array} - Array of content parts and media data
 */
export const parseContentWithMedia = (content) => {
  if (!content) return [{type: 'text', content: ''}];
  
  // Check if the content is just a URL
  const contentTrimmed = content.trim();
  const mediaType = getMediaType(contentTrimmed);
  
  if (mediaType === 'youtube') {
    const videoId = getYouTubeVideoId(contentTrimmed);
    if (videoId) {
      return [createYouTubeEmbed(videoId)];
    }
  }
  
  if (mediaType === 'suno') {
    const songId = getSunoSongId(contentTrimmed);
    if (songId) {
      return [createSunoEmbed(songId)];
    }
    // Fallback for Suno URLs that don't match the expected pattern
    if (contentTrimmed.includes('suno.com')) {
      // Extract the URL parameters to create a proper embed
      try {
        const urlObj = new URL(contentTrimmed);
        const songIdFromSearch = urlObj.searchParams.get('sh');
        if (songIdFromSearch) {
          return [createSunoEmbed(songIdFromSearch)];
        }
      } catch (e) {
        // If URL parsing fails, just show as a link
      }
    }
  }
  
  if (mediaType === 'url') {
    return [createUrlLink(contentTrimmed)];
  }
  
  // Parse content for embedded links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  
  const result = [];
  
  parts.forEach((part, index) => {
    if (urlRegex.test(part)) {
      const mediaType = getMediaType(part);
      
      if (mediaType === 'youtube') {
        const videoId = getYouTubeVideoId(part);
        if (videoId) {
          result.push(createYouTubeEmbed(videoId));
        } else {
          result.push(createUrlLink(part));
        }
      } else if (mediaType === 'suno') {
        const songId = getSunoSongId(part);
        if (songId) {
          result.push(createSunoEmbed(songId));
        } else {
          // Fallback for Suno URLs that don't match the expected pattern
          if (part.includes('suno.com')) {
            try {
              const urlObj = new URL(part);
              const songIdFromSearch = urlObj.searchParams.get('sh');
              if (songIdFromSearch) {
                result.push(createSunoEmbed(songIdFromSearch));
              } else {
                result.push(createUrlLink(part));
              }
            } catch (e) {
              // If URL parsing fails, just show as a link
              result.push(createUrlLink(part));
            }
          } else {
            result.push(createUrlLink(part));
          }
        }
      } else {
        result.push(createUrlLink(part));
      }
    } else if (part) {
      result.push({
        type: 'text',
        content: part
      });
    }
  });
  
  return result;
};
