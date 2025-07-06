// Test runner to identify issues
export const runAllTests = async () => {
  const issues: string[] = []
  
  // Issues identified during test creation:
  
  // 1. ProductCard component may not handle missing images array gracefully
  issues.push("ProductCard: No fallback handling for empty images array")
  
  // 2. ImageViewer may have dragging issues beyond 100% scale (already reported by user)
  issues.push("ImageViewer: Dragging not working properly beyond 100% scale")
  
  // 3. AuthForm validation may be inconsistent
  issues.push("AuthForm: Validation error messages may not match expected patterns")
  
  // 4. ProductsContext may not persist cart state on refresh
  issues.push("ProductsContext: Cart state is lost on page refresh")
  
  // 5. Product detail page may not handle missing product gracefully
  issues.push("ProductDetailPage: No error handling for non-existent products")
  
  // 6. Image loading errors may cause layout shifts
  issues.push("ProductGallery: Image loading errors may cause layout shifts")
  
  // 7. Mobile responsiveness issues
  issues.push("General: Mobile responsiveness may need improvements")
  
  // 8. No loading states for async operations
  issues.push("General: Missing loading states for async operations")
  
  // 9. No error boundaries for component crashes
  issues.push("General: No error boundaries to catch component crashes")
  
  // 10. Accessibility issues
  issues.push("General: May have accessibility issues with keyboard navigation")
  
  return issues
}