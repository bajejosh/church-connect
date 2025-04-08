// src/components/prayer/CategoryFilterDropdown.jsx
import { useState } from 'react'
import { FaTags } from 'react-icons/fa'

const CategoryFilterDropdown = ({ categories, activeCategories, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleCategoryToggle = (category) => {
    if (activeCategories.includes(category)) {
      onChange(activeCategories.filter(c => c !== category));
    } else {
      onChange([...activeCategories, category]);
    }
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <FaTags className="mr-1" />
        Categories
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
          <div className="py-1">
            {categories.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No categories found</div>
            ) : (
              categories.map(category => (
                <div key={category} className="px-4 py-2 flex items-center">
                  <input
                    type="checkbox"
                    id={`category-${category}`}
                    checked={activeCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {category}
                  </label>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryFilterDropdown;