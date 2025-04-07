// src/components/songs/LyricsDisplay.jsx
import React from 'react';

const LyricsDisplay = ({ lyrics }) => {
  // Function to split the lyrics into verses
  const processLyrics = (lyricsText) => {
    if (!lyricsText) return [];
    
    // Split by verse markers like [Verse 1], [Chorus], etc.
    const versePattern = /\[(.*?)\]/g;
    const verseSections = lyricsText.split(versePattern).filter(section => section.trim());
    
    // Group into pairs of verse title and content
    const verses = [];
    for (let i = 0; i < verseSections.length; i += 2) {
      const title = verseSections[i];
      const content = verseSections[i + 1]?.trim() || '';
      
      if (title && content) {
        verses.push({ title, content });
      } else if (title && !content) {
        // If we have just a title without content, it might be part of the previous section
        // This handles cases where there's text without a section header
        verses.push({ title: '', content: title });
      }
    }
    
    return verses;
  };

  const verses = processLyrics(lyrics);

  return (
    <div className="lyrics-display">
      {verses.length > 0 ? (
        <div className="space-y-6">
          {verses.map((verse, index) => (
            <div key={index} className="verse-container">
              {verse.title && (
                <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">
                  [{verse.title}]
                </h3>
              )}
              <div className="verse-content whitespace-pre-line text-gray-800 dark:text-gray-200 leading-relaxed">
                {verse.content}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 dark:text-gray-400 italic">
          No lyrics available for this song.
        </div>
      )}
    </div>
  );
};

export default LyricsDisplay;
