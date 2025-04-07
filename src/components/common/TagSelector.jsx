import React, { useState } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';

/**
 * A reusable tag selector component
 * @param {Object} props
 * @param {Array} props.tags - Array of selected tags
 * @param {Function} props.onTagsChange - Callback when tags change
 * @param {Array} props.options - Array of available tag options
 * @param {boolean} props.allowCustom - Whether to allow custom tags
 * @param {string} props.placeholder - Placeholder text for input
 * @param {string} props.label - Label text
 * @param {string} props.name - Input name
 */
const TagSelector = ({ 
  tags = [], 
  onTagsChange, 
  options = [],
  allowCustom = false,
  placeholder = "Add a tag...",
  label = "Tags",
  name = "tags",
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Filter options that aren't already selected and match input value
  const filteredOptions = options
    .filter(option => !tags.includes(option))
    .filter(option => option.toLowerCase().includes(inputValue.toLowerCase()));

  const handleAddTag = (tag) => {
    if (!tag) return;
    
    // Add the tag if it doesn't already exist
    if (!tags.includes(tag)) {
      onTagsChange([...tags, tag]);
    }
    
    // Clear input and close dropdown
    setInputValue('');
    setShowDropdown(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    // Add tag on enter if input has value and either custom tags are allowed or it's in options
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      
      if (allowCustom || options.includes(inputValue)) {
        handleAddTag(inputValue);
      } else if (filteredOptions.length > 0) {
        // If not allowing custom, but there's a matching option, add the first match
        handleAddTag(filteredOptions[0]);
      }
    }
    
    // Close dropdown on escape
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      {/* Selected tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <div 
            key={tag}
            className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-md text-sm"
          >
            <span>{tag}</span>
            <button 
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 p-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
              aria-label={`Remove ${tag}`}
            >
              <FaTimes size={10} />
            </button>
          </div>
        ))}
      </div>
      
      {/* Tag input */}
      <div className="relative">
        <input
          type="text"
          id={name}
          name={name}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => {
            // Delay hiding dropdown to allow for option clicks
            setTimeout(() => setShowDropdown(false), 200);
          }}
          onKeyDown={handleKeyDown}
        />
        
        {/* Dropdown options */}
        {showDropdown && inputValue && filteredOptions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
            {filteredOptions.map(option => (
              <div
                key={option}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                onMouseDown={() => handleAddTag(option)}
              >
                <FaPlus className="text-blue-500 mr-2" size={12} />
                <span>{option}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Show "Add custom tag" if input has value, no matches, and custom tags allowed */}
        {showDropdown && inputValue && filteredOptions.length === 0 && allowCustom && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700">
            <div
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
              onMouseDown={() => handleAddTag(inputValue)}
            >
              <FaPlus className="text-blue-500 mr-2" size={12} />
              <span>Add "{inputValue}"</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagSelector;
