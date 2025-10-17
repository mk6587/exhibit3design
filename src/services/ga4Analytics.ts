// GA4 E-commerce Analytics Service
// Handles all GA4 e-commerce events for the funnel tracking

export interface GAItem {
  item_id: string;
  item_name: string;
  currency: string;
  price: number;
  quantity?: number;
  item_category?: string;
  item_variant?: string;
  item_brand?: string;
  affiliation?: string;
  coupon?: string;
  discount?: number;
  index?: number;
  item_list_name?: string;
  item_list_id?: string;
}

export interface GAEcommerceEvent {
  currency: string;
  value: number;
  items: GAItem[];
  transaction_id?: string;
  affiliation?: string;
  shipping?: number;
  tax?: number;
  coupon?: string;
  shipping_tier?: string;
  payment_type?: string;
  item_list_id?: string;
  item_list_name?: string;
}

// Debounce utility to prevent rapid-fire events
const debounceTimers: { [key: string]: NodeJS.Timeout } = {};

const debounce = (key: string, func: () => void, delay: number = 500) => {
  if (debounceTimers[key]) {
    clearTimeout(debounceTimers[key]);
  }
  debounceTimers[key] = setTimeout(func, delay);
};

// Helper function to check if gtag is available
const isGtagAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Convert cart item to GA4 item format
const convertToGAItem = (cartItem: any, index?: number): GAItem => {
  return {
    item_id: cartItem.id.toString(),
    item_name: cartItem.title,
    currency: 'EUR',
    price: cartItem.price,
    quantity: cartItem.quantity || 1,
    item_category: 'Exhibition Stands',
    item_brand: 'Exhibit3Design',
    index: index
  };
};

// Convert product to GA4 item format
const convertProductToGAItem = (product: any, index?: number): GAItem => {
  return {
    item_id: product.id.toString(),
    item_name: product.title,
    currency: 'EUR',
    price: product.price,
    quantity: 1,
    item_category: 'Exhibition Stands',
    item_brand: 'Exhibit3Design',
    index: index
  };
};

// 1. View Item List (Products page)
export const trackViewItemList = (products: any[], listName: string = 'All Products') => {
  if (!isGtagAvailable()) return;

  const items = products.map((product, index) => convertProductToGAItem(product, index + 1));

  window.gtag('event', 'view_item_list', {
    item_list_id: 'products_all',
    item_list_name: listName,
    items: items
  });

  console.log('GA4: view_item_list tracked', { listName, itemCount: items.length });
};

// 2. View Item (Product detail page)
export const trackViewItem = (product: any) => {
  if (!isGtagAvailable()) return;

  const item = convertProductToGAItem(product);

  window.gtag('event', 'view_item', {
    currency: 'EUR',
    value: product.price,
    items: [item]
  });

  console.log('GA4: view_item tracked', { productId: product.id, productName: product.title });
};

// 3. Add to Cart
export const trackAddToCart = (product: any, quantity: number = 1) => {
  if (!isGtagAvailable()) return;

  const item = convertProductToGAItem(product);
  item.quantity = quantity;

  window.gtag('event', 'add_to_cart', {
    currency: 'EUR',
    value: product.price * quantity,
    items: [item]
  });

  console.log('GA4: add_to_cart tracked', { productId: product.id, quantity });
};

// 4. View Cart
export const trackViewCart = (cartItems: any[], cartTotal: number) => {
  if (!isGtagAvailable()) return;

  const items = cartItems.map((item, index) => convertToGAItem(item, index + 1));

  window.gtag('event', 'view_cart', {
    currency: 'EUR',
    value: cartTotal,
    items: items
  });

  console.log('GA4: view_cart tracked', { cartTotal, itemCount: items.length });
};

// 5. Begin Checkout
export const trackBeginCheckout = (cartItems: any[], cartTotal: number) => {
  if (!isGtagAvailable()) return;

  const items = cartItems.map((item, index) => convertToGAItem(item, index + 1));

  window.gtag('event', 'begin_checkout', {
    currency: 'EUR',
    value: cartTotal,
    items: items
  });

  console.log('GA4: begin_checkout tracked', { cartTotal, itemCount: items.length });
};

// 6. Add Shipping Info
export const trackAddShippingInfo = (cartItems: any[], cartTotal: number, shippingTier: string = 'Digital') => {
  if (!isGtagAvailable()) return;

  const items = cartItems.map((item, index) => convertToGAItem(item, index + 1));

  window.gtag('event', 'add_shipping_info', {
    currency: 'EUR',
    value: cartTotal,
    shipping_tier: shippingTier,
    items: items
  });

  console.log('GA4: add_shipping_info tracked', { cartTotal, shippingTier });
};

// 7. Add Payment Info
export const trackAddPaymentInfo = (cartItems: any[], cartTotal: number, paymentType: string = 'Stripe') => {
  if (!isGtagAvailable()) return;

  const items = cartItems.map((item, index) => convertToGAItem(item, index + 1));

  window.gtag('event', 'add_payment_info', {
    currency: 'EUR',
    value: cartTotal,
    payment_type: paymentType,
    items: items
  });

  console.log('GA4: add_payment_info tracked', { cartTotal, paymentType });
};

// 8. Purchase (Most important - call on payment success)
export const trackPurchase = (
  transactionId: string,
  cartItems: any[],
  cartTotal: number,
  affiliation: string = 'Stripe'
) => {
  if (!isGtagAvailable()) return;

  const items = cartItems.map((item, index) => convertToGAItem(item, index + 1));

  window.gtag('event', 'purchase', {
    transaction_id: transactionId,
    affiliation: affiliation,
    currency: 'EUR',
    value: cartTotal,
    items: items
  });

  console.log('GA4: purchase tracked', { transactionId, cartTotal, affiliation });
};

// 9. Refund (for future use)
export const trackRefund = (
  transactionId: string,
  cartItems: any[],
  refundAmount: number
) => {
  if (!isGtagAvailable()) return;

  const items = cartItems.map((item, index) => convertToGAItem(item, index + 1));

  window.gtag('event', 'refund', {
    transaction_id: transactionId,
    currency: 'EUR',
    value: refundAmount,
    items: items
  });

  console.log('GA4: refund tracked', { transactionId, refundAmount });
};

// Additional tracking functions for product filtering

// Track search events (GA4 standard search event)
export const trackSearch = (searchTerm: string, resultsCount: number) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'search', {
    search_term: searchTerm,
    results_count: resultsCount
  });

  console.log('GA4: search tracked', { searchTerm, resultsCount });
};

// Track filter application (debounced to prevent rapid-fire events)
export const trackFilterApplied = (filterType: string, filterValue: string, resultsCount: number) => {
  if (!isGtagAvailable()) return;

  debounce('filter_applied', () => {
    window.gtag('event', 'filter_applied', {
      filter_type: filterType,
      filter_value: filterValue,
      results_count: resultsCount,
      custom_parameters: {
        engagement_time_msec: 100
      }
    });
    console.log('GA4: filter_applied tracked', { filterType, filterValue, resultsCount });
  }, 1000);
};

// Track sort changes (debounced)
export const trackSortChanged = (sortType: string, resultsCount: number) => {
  if (!isGtagAvailable()) return;

  debounce('sort_changed', () => {
    window.gtag('event', 'sort_changed', {
      sort_type: sortType,
      results_count: resultsCount,
      custom_parameters: {
        engagement_time_msec: 100
      }
    });
    console.log('GA4: sort_changed tracked', { sortType, resultsCount });
  }, 500);
};

// Track filters cleared
export const trackFiltersCleared = (previousFiltersCount: number, resultsCount: number) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'filters_cleared', {
    previous_filters_count: previousFiltersCount,
    results_count: resultsCount,
    custom_parameters: {
      engagement_time_msec: 100
    }
  });
};

// Track page views
export const trackPageView = (pagePath: string, pageTitle: string) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    page_location: window.location.href
  });

  console.log('GA4: page_view tracked', { pagePath, pageTitle });
};

// Track button clicks
export const trackButtonClick = (buttonName: string, buttonLocation: string, additionalData?: any) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'button_click', {
    button_name: buttonName,
    button_location: buttonLocation,
    ...additionalData
  });

  console.log('GA4: button_click tracked', { buttonName, buttonLocation, additionalData });
};

// Track form submissions
export const trackFormSubmit = (formName: string, formLocation: string) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'form_submit', {
    form_name: formName,
    form_location: formLocation
  });

  console.log('GA4: form_submit tracked', { formName, formLocation });
};

// Track user engagement events
export const trackEngagement = (eventName: string, eventData?: any) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', eventName, {
    engagement_time_msec: 100,
    ...eventData
  });

  console.log('GA4: engagement tracked', { eventName, eventData });
};

// Track subscription events with full details
export const trackSubscriptionEvent = (
  action: 'subscribe' | 'upgrade' | 'downgrade' | 'cancel' | 'renew',
  planDetails: {
    plan_id: string;
    plan_name: string;
    plan_price: number;
    billing_period: string;
    ai_tokens: number;
    video_results: number;
    max_files: number;
    file_access_tier: string;
  }
) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'subscription_action', {
    action: action,
    transaction_id: `sub_${Date.now()}`,
    value: planDetails.plan_price,
    currency: 'EUR',
    plan_id: planDetails.plan_id,
    plan_name: planDetails.plan_name,
    billing_period: planDetails.billing_period,
    ai_tokens_included: planDetails.ai_tokens,
    video_results_included: planDetails.video_results,
    max_files: planDetails.max_files,
    access_tier: planDetails.file_access_tier
  });

  console.log('GA4: subscription_action tracked', { action, planDetails });
};

// Track AI token usage
export const trackAITokenUsage = (
  action: 'generate' | 'deduct' | 'grant',
  details: {
    tokens_used?: number;
    tokens_remaining: number;
    service_type?: string;
    prompt?: string;
    success: boolean;
  }
) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'ai_token_usage', {
    action: action,
    tokens_used: details.tokens_used || 0,
    tokens_remaining: details.tokens_remaining,
    service_type: details.service_type || 'unknown',
    success: details.success,
    timestamp: Date.now()
  });

  console.log('GA4: ai_token_usage tracked', { action, details });
};

// Track video results usage
export const trackVideoResultUsage = (
  action: 'generate' | 'deduct' | 'grant',
  details: {
    results_used?: number;
    results_remaining: number;
    success: boolean;
  }
) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'video_result_usage', {
    action: action,
    results_used: details.results_used || 0,
    results_remaining: details.results_remaining,
    success: details.success,
    timestamp: Date.now()
  });

  console.log('GA4: video_result_usage tracked', { action, details });
};

// Set user properties for segmentation
export const setUserProperties = (properties: {
  user_id?: string;
  subscription_tier?: string;
  subscription_status?: 'active' | 'inactive' | 'cancelled';
  ai_tokens_balance?: number;
  video_results_balance?: number;
  max_files?: number;
  customer_lifetime_value?: number;
}) => {
  if (!isGtagAvailable()) return;

  window.gtag('set', 'user_properties', {
    subscription_tier: properties.subscription_tier || 'free',
    subscription_status: properties.subscription_status || 'inactive',
    ai_tokens_balance: properties.ai_tokens_balance || 0,
    video_results_balance: properties.video_results_balance || 0,
    max_files_allowed: properties.max_files || 0,
    lifetime_value: properties.customer_lifetime_value || 0
  });

  if (properties.user_id) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      user_id: properties.user_id
    });
  }

  console.log('GA4: user_properties set', properties);
};

// Track profile updates
export const trackProfileUpdate = (updatedFields: string[]) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'profile_update', {
    fields_updated: updatedFields.join(','),
    field_count: updatedFields.length
  });

  console.log('GA4: profile_update tracked', { updatedFields });
};

// Track AI Studio events
export const trackAIStudio = (action: string, productId?: number, productName?: string) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'ai_studio_action', {
    action: action,
    product_id: productId,
    product_name: productName
  });

  console.log('GA4: ai_studio_action tracked', { action, productId, productName });
};

// Track file selection with subscription context
export const trackFileSelection = (
  productId: number, 
  productName: string, 
  fileCount: number,
  subscriptionTier?: string,
  maxFilesAllowed?: number
) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'file_selected', {
    product_id: productId,
    product_name: productName,
    total_files_selected: fileCount,
    subscription_tier: subscriptionTier || 'free',
    max_files_allowed: maxFilesAllowed || 0,
    usage_percentage: maxFilesAllowed ? (fileCount / maxFilesAllowed) * 100 : 0
  });

  console.log('GA4: file_selected tracked', { 
    productId, 
    productName, 
    fileCount,
    subscriptionTier,
    maxFilesAllowed
  });
};

// Track authentication events
export const trackAuthEvent = (
  action: 'sign_up' | 'login' | 'logout' | 'password_reset',
  method?: 'email' | 'google' | 'otp'
) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', action, {
    method: method || 'email'
  });

  console.log('GA4: auth event tracked', { action, method });
};

// Track errors
export const trackError = (
  errorType: string,
  errorMessage: string,
  location: string
) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'exception', {
    description: errorMessage,
    error_type: errorType,
    location: location,
    fatal: false
  });

  console.log('GA4: error tracked', { errorType, errorMessage, location });
};

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}