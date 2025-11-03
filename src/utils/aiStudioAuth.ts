/**
 * Navigate to AI Studio
 * Sessions are automatically shared via cookies across subdomains
 * No authentication tokens needed - cookies handle everything
 */
export function navigateToAIStudio(serviceId?: string) {
  const baseUrl = 'https://ai.exhibit3design.com';
  const url = serviceId ? `${baseUrl}?service=${serviceId}` : baseUrl;
  window.open(url, '_blank', 'noopener,noreferrer');
}
