// src/components/songs/ChordDisplay.jsx
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Enhanced component to display chord charts with properly aligned chords above lyrics
 * and improved section formatting
 */
const ChordDisplay = ({ content, className = '' }) => {
  if (!content) return null;
  
  // Process the content to identify chord lines, lyric lines and sections
  const processedContent = processChordContent(content);
  
  return (
    <div className={`font-mono text-sm ${className}`}>
      {processedContent.map((section, sectionIndex) => (
        <div 
          key={`section-${sectionIndex}`} 
          className="chord-section mb-6"
        >
          {/* Section title, if present */}
          {section.title && (
            <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">
              {section.title}
            </h3>
          )}
          
          {/* Section content */}
          <div className="chord-section-content pl-0 md:pl-2">
            {section.lines.map((line, lineIndex) => {
              if (line.type === 'chord-lyric-pair') {
                return (
                  <div key={`line-${sectionIndex}-${lineIndex}`} className="mb-1">
                    <div className="text-blue-600 dark:text-blue-400 font-bold whitespace-pre">{line.chords}</div>
                    <div className="whitespace-pre text-gray-900 dark:text-gray-100">{line.lyrics}</div>
                  </div>
                );
              } else {
                // Handle empty lines
                if (line.content.trim() === '') {
                  return <div key={`line-${sectionIndex}-${lineIndex}`} className="h-4"></div>;
                }
                // Comment or other non-chord, non-section line
                return (
                  <div 
                    key={`line-${sectionIndex}-${lineIndex}`} 
                    className="whitespace-pre mb-1 text-gray-900 dark:text-gray-100"
                  >
                    {line.content}
                  </div>
                );
              }
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Process chord content into sections with chord-lyric pairs and regular lines
 */
function processChordContent(content) {
  if (!content) return [];
  
  const lines = content.split('\n');
  const sections = [];
  let currentSection = { lines: [] };
  
  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : null;
    
    // Check if this is a section marker
    const sectionMatch = currentLine.trim().match(/^\[(.*?)\]$/);
    if (sectionMatch) {
      // If we already have content in the current section, save it
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      
      // Start a new section with this title
      currentSection = {
        title: sectionMatch[0], // Keep brackets for consistency
        lines: []
      };
      continue;
    }
    
    // Detect chord lines
    const isChordLine = isLikelyChordLine(currentLine);
    
    if (isChordLine && nextLine && !isLikelyChordLine(nextLine)) {
      // This is a chord line followed by lyrics
      currentSection.lines.push({
        type: 'chord-lyric-pair',
        chords: currentLine,
        lyrics: nextLine
      });
      i++; // Skip the next line since we've processed it
    } else {
      // This is just a regular line (comment, etc.)
      currentSection.lines.push({
        type: 'text',
        content: currentLine
      });
    }
  }
  
  // Add the last section if it has content
  if (currentSection.lines.length > 0) {
    sections.push(currentSection);
  }
  
  return sections;
}

/**
 * Helper function to detect if a line is likely a chord line
 */
function isLikelyChordLine(line) {
  if (!line || line.trim() === '') return false;
  
  // Chord lines usually have a lot of spaces between chords
  const spacingPattern = /\s{2,}/;
  if (!spacingPattern.test(line)) return false;
  
  // Common chord patterns (matches things like C, Am, F#m7, Gsus4, etc.)
  const chordPattern = /^[A-G][#b]?(m|maj|min|aug|dim|sus|add|2|4|5|6|7|9|11|13|-|\+|\/)*/;
  
  // Split by multiple spaces and check if chunks match chord patterns
  const chunks = line.split(/\s{2,}/);
  
  // The line is likely a chord line if at least half of the non-empty chunks match chord patterns
  const nonEmptyChunks = chunks.filter(chunk => chunk.trim() !== '');
  if (nonEmptyChunks.length === 0) return false;
  
  const chordMatches = nonEmptyChunks.filter(chunk => chordPattern.test(chunk.trim()));
  return chordMatches.length >= nonEmptyChunks.length / 2;
}

ChordDisplay.propTypes = {
  content: PropTypes.string,
  className: PropTypes.string
};

export default ChordDisplay;
