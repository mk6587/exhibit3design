// Utility to hide external welcome modals that might be injected by scripts
export const hideWelcomeModals = () => {
  const hideModal = () => {
    // List of selectors that might contain the welcome modal, auth forms, or success popups
    const selectors = [
      '[data-testid*="welcome"]',
      '[class*="welcome-modal"]', 
      '[class*="welcome-dialog"]',
      '[class*="congratulations"]',
      '[class*="success-modal"]',
      '[class*="login-success"]',
      '[class*="auth-success"]',
      '[role="dialog"]',
      '[role="alertdialog"]',
      '[class*="toast"]',
      '[class*="notification"]',
      '[class*="alert"]',
      'div[style*="position: fixed"]',
      'div[style*="position: absolute"]',
      'div[style*="z-index: 999"]',
      'div[style*="z-index: 9999"]'
    ];

    // Keywords to identify the welcome modal content, auth forms, and success messages
    const keywords = [
      'Welcome to Exhibit3Design',
      'Congratulations',
      'professional exhibition',
      'Continue to Exhibit3Design',
      'Your email has been confirmed successfully',
      'Enter your email and password to sign in or register',
      'Enter your email and password',
      'Forgot Password?',
      'Login successful',
      'Authentication successful',
      'Sign in successful',
      'Successfully signed in',
      'Welcome back',
      'Login complete',
      'Authentication complete',
      'You have successfully',
      'Account verified',
      'Profile created'
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const text = element.textContent || '';
        // Check if the element contains any of the welcome modal keywords
        if (keywords.some(keyword => text.includes(keyword))) {
          // Hide the element and its parent containers
          (element as HTMLElement).style.display = 'none';
          (element as HTMLElement).style.visibility = 'hidden';
          (element as HTMLElement).style.opacity = '0';
          (element as HTMLElement).style.pointerEvents = 'none';
          
          // Also hide potential parent modal containers
          let parent = element.parentElement;
          while (parent && parent !== document.body) {
            const parentStyle = window.getComputedStyle(parent);
            if (parentStyle.position === 'fixed' || parentStyle.position === 'absolute') {
              (parent as HTMLElement).style.display = 'none';
              break;
            }
            parent = parent.parentElement;
          }
        }
      });
    });

    // Also hide old auth forms specifically
    const oldAuthForms = document.querySelectorAll('form');
    oldAuthForms.forEach(form => {
      const hasEmailInput = form.querySelector('input[type="email"], input[placeholder*="email"]');
      const hasPasswordInput = form.querySelector('input[type="password"], input[placeholder*="password"]');
      const hasWelcomeText = form.textContent?.includes('Welcome to Exhibit3Design');
      
      if (hasEmailInput && hasPasswordInput && hasWelcomeText) {
        (form as HTMLElement).style.display = 'none';
        // Hide the entire parent container too
        let parent = form.parentElement;
        while (parent && parent !== document.body) {
          (parent as HTMLElement).style.display = 'none';
          parent = parent.parentElement;
        }
      }
    });
  };

  // Run immediately
  hideModal();

  // Run when DOM changes (for dynamically added modals)
  const observer = new MutationObserver(hideModal);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Run periodically as backup
  const interval = setInterval(hideModal, 500); // Check more frequently

  // Clean up after 60 seconds (increased time to catch delayed popups)
  setTimeout(() => {
    observer.disconnect();
    clearInterval(interval);
  }, 60000);
  
  // Also run the hide function when auth state changes
  window.addEventListener('authStateChanged', hideModal);
  
  // Run when page visibility changes (handles tab switching)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      setTimeout(hideModal, 100);
    }
  });
};