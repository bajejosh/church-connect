// Utility for consistent input styling
export const inputStyles = {
  base: 'form-input',
  textarea: 'form-textarea',
  select: 'form-select'
}

// Helper function to combine styles
export const combineStyles = (...styles) => {
  return styles.filter(Boolean).join(' ')
}
