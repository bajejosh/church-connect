// src/components/songs/SongAttachments.jsx
import { useState, useEffect, useRef } from 'react';
import { FaFileAlt, FaMusic, FaFileAudio, FaPlus, FaTrash, FaDownload, FaYoutube, FaLink } from 'react-icons/fa';
import { uploadSongAttachment, listSongAttachments, deleteSongAttachment } from '../../lib/songAPI';
import { supabase } from '../../lib/supabase';

/**
 * Component for managing song attachments
 */
const SongAttachments = ({ songId, readOnly = false }) => {
  const [attachments, setAttachments] = useState({
    'chord-charts': [],
    'sheet-music': [],
    'backing-tracks': [],
    'youtube-links': []
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  
  const fileInputRef = useRef(null);
  const [selectedType, setSelectedType] = useState(null);
  
  // Attachment type options for the UI
  const attachmentTypes = [
    { value: 'chord-charts', label: 'Chord Charts', icon: <FaFileAlt /> },
    { value: 'sheet-music', label: 'Sheet Music', icon: <FaMusic /> },
    { value: 'backing-tracks', label: 'Backing Tracks', icon: <FaFileAudio /> },
    { value: 'youtube-links', label: 'YouTube Links', icon: <FaYoutube /> }
  ];
  
  // Load attachments
  useEffect(() => {
    const loadAttachments = async () => {
      if (!songId) return;
      
      try {
        setLoading(true);
        const data = await listSongAttachments(songId);
        
        // Check if the youtube_links table exists before trying to query it
        try {
          // Fetch YouTube links from the database
          const { data: youtubeData, error } = await supabase
            .from('song_youtube_links')
            .select('*')
            .eq('song_id', songId);
          
          if (error && error.code === '42P01') {
            // Table doesn't exist yet, just use an empty array
            console.log('YouTube links table not yet created');
            setAttachments({
              ...data,
              'youtube-links': []
            });
          } else if (error) {
            throw error;
          } else {
            // Add YouTube links to attachments
            const youtubeLinks = youtubeData || [];
            const allAttachments = {
              ...data,
              'youtube-links': youtubeLinks.map(link => ({
                name: link.title || 'YouTube Video',
                url: link.url,
                id: link.id
              }))
            };
            
            setAttachments(allAttachments);
          }
        } catch (err) {
          console.log('Could not fetch YouTube links:', err);
          setAttachments({
            ...data,
            'youtube-links': []
          });
        }
      } catch (err) {
        console.error('Error loading attachments:', err);
        setError('Failed to load attachments');
      } finally {
        setLoading(false);
      }
    };
    
    loadAttachments();
  }, [songId]);
  
  // Handle file upload
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    
    if (!file || !selectedType) {
      return;
    }
    
    try {
      setUploading(true);
      
      await uploadSongAttachment(songId, file, selectedType);
      
      // Refresh the list
      const data = await listSongAttachments(songId);
      setAttachments(prev => ({
        ...prev,
        ...data
      }));
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file');
    } finally {
      setUploading(false);
      setSelectedType(null);
    }
  };

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    
    // Regular expressions to handle various YouTube URL formats
    const regExps = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\s]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^\s]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^\s]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^\s?]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^\s?]+)/,
    ];
    
    for (const regExp of regExps) {
      const match = url.match(regExp);
      if (match && match[1]) {
        return match[1].substring(0, 11);
      }
    }
    
    return null;
  };
  
  // Add YouTube link
  const handleAddYoutubeLink = async () => {
    if (!youtubeUrl.trim()) return;
    
    const videoId = getYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      setError('Invalid YouTube URL');
      return;
    }
    
    try {
      setUploading(true);
      
      // Generate a title from the URL or use a default
      let title = 'YouTube Video';
      try {
        const response = await fetch(`https://www.youtube.com/oembed?url=${youtubeUrl}&format=json`);
        const data = await response.json();
        if (data.title) {
          title = data.title;
        }
      } catch (err) {
        console.log('Could not fetch video title, using default');
      }
      
      // Add YouTube link to database
      const { data, error } = await supabase
        .from('song_youtube_links')
        .insert({
          song_id: songId,
          url: youtubeUrl,
          title: title,
          video_id: videoId
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      setAttachments(prev => ({
        ...prev,
        'youtube-links': [
          ...prev['youtube-links'] || [],
          {
            name: title,
            url: youtubeUrl,
            id: data.id
          }
        ]
      }));
      
      // Reset input
      setYoutubeUrl('');
      setShowYoutubeInput(false);
      
    } catch (err) {
      console.error('Error adding YouTube link:', err);
      setError('Failed to add YouTube link');
    } finally {
      setUploading(false);
    }
  };
  
  // Handle file deletion
  const handleDelete = async (type, fileName, id) => {
    try {
      if (type === 'youtube-links') {
        // Delete YouTube link from database
        const { error } = await supabase
          .from('song_youtube_links')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } else {
        // Delete file from storage
        await deleteSongAttachment(songId, type, fileName);
      }
      
      // Update local state to remove the item
      setAttachments(prev => ({
        ...prev,
        [type]: prev[type].filter(item => 
          type === 'youtube-links' ? item.id !== id : item.name !== fileName
        )
      }));
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item');
    }
  };
  
  // Trigger file input click when type is selected
  const selectFileType = (type) => {
    if (type === 'youtube-links') {
      setShowYoutubeInput(true);
      return;
    }
    
    setSelectedType(type);
    
    // Small delay to ensure state is updated
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 100);
  };
  
  // Helper function to render file icon based on file type
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FaFileAlt className="text-red-500" />;
      case 'doc':
      case 'docx':
        return <FaFileAlt className="text-blue-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
        return <FaFileAlt className="text-green-500" />;
      case 'mp3':
      case 'wav':
      case 'm4a':
        return <FaFileAudio className="text-purple-500" />;
      default:
        return <FaFileAlt className="text-gray-500" />;
    }
  };
  
  if (loading) {
    return <div className="text-gray-500 text-sm">Loading attachments...</div>;
  }
  
  // Check if there are any attachments
  const hasAttachments = Object.values(attachments).some(files => files && files.length > 0);
  
  return (
    <div className="song-attachments">
      {error && (
        <div className="mb-3 text-sm text-red-500">{error}</div>
      )}
      
      {/* File upload input (hidden) */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleUpload}
        disabled={uploading}
      />
      
      {/* YouTube link input */}
      {showYoutubeInput && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="flex items-center mb-2">
            <FaYoutube className="text-red-600 mr-2" />
            <span className="font-medium text-sm">Add YouTube Link</span>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste YouTube URL here"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="flex-1 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <div className="flex gap-1">
              <button
                onClick={handleAddYoutubeLink}
                disabled={uploading || !youtubeUrl.trim()}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowYoutubeInput(false);
                  setYoutubeUrl('');
                }}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Upload controls */}
      {!readOnly && !showYoutubeInput && (
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-2">Add Attachment:</div>
          <div className="flex flex-wrap gap-2">
            {attachmentTypes.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => selectFileType(type.value)}
                disabled={uploading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {uploading && selectedType === type.value ? (
                  <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-gray-500 rounded-full"></span>
                ) : (
                  <>
                    {type.icon}
                    <FaPlus className="ml-1 mr-1" size={10} />
                  </>
                )}
                {type.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Attachments display */}
      {hasAttachments ? (
        <div className="space-y-4">
          {attachmentTypes.map(type => {
            const files = attachments[type.value] || [];
            if (files.length === 0) return null;
            
            return (
              <div key={type.value} className="attachment-section">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  {type.icon}
                  <span className="ml-2">{type.label}</span>
                  <span className="ml-2 text-xs text-gray-500">({files.length})</span>
                </h4>
                
                <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
                  {files.map(file => (
                    <li key={file.id || file.name} className="px-4 py-3 bg-white flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center">
                        {type.value === 'youtube-links' ? (
                          <FaYoutube className="text-red-600" />
                        ) : (
                          getFileIcon(file.name)
                        )}
                        <span className="ml-2 text-sm text-gray-600 truncate max-w-xs">
                          {file.name}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                          title={type.value === 'youtube-links' ? 'View on YouTube' : 'Download'}
                        >
                          {type.value === 'youtube-links' ? <FaLink /> : <FaDownload />}
                        </a>
                        
                        {!readOnly && (
                          <button
                            type="button"
                            onClick={() => handleDelete(type.value, file.name, file.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-gray-500 p-4 bg-gray-50 text-center rounded-md">
          No attachments available for this song.
          {!readOnly && (
            <p className="mt-1 text-xs">
              Use the buttons above to add chord charts, sheet music, backing tracks, or YouTube links.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SongAttachments;
