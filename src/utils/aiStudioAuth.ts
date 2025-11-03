/**
 * Helper utility for navigating to AI Studio
 * Sessions are automatically shared via cookies across subdomains
 */

/**
 * Navigate to AI Studio - session will be automatically available via cookies
 */
export function navigateToAIStudio(serviceId?: string) {
  const baseUrl = 'https://ai.exhibit3design.com';
  const url = serviceId ? `${baseUrl}?service=${serviceId}` : baseUrl;
  window.location.href = url;
}

/**
 * Legacy function name for backwards compatibility
 */
export function openAIStudio(userId: string, email: string, queryParams?: string) {
  const serviceMatch = queryParams?.match(/[?&]service=([^&]+)/);
  const serviceId = serviceMatch ? serviceMatch[1] : undefined;
  return navigateToAIStudio(serviceId);
}
