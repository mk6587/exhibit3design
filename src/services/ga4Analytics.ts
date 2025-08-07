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

// Track filter application
export const trackFilterApplied = (filterType: string, filterValue: string, resultsCount: number) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'filter_applied', {
    filter_type: filterType,
    filter_value: filterValue,
    results_count: resultsCount,
    custom_parameters: {
      engagement_time_msec: 100
    }
  });

  console.log('GA4: filter_applied tracked', { filterType, filterValue, resultsCount });
};

// Track sort changes
export const trackSortChanged = (sortType: string, resultsCount: number) => {
  if (!isGtagAvailable()) return;

  window.gtag('event', 'sort_changed', {
    sort_type: sortType,
    results_count: resultsCount,
    custom_parameters: {
      engagement_time_msec: 100
    }
  });

  console.log('GA4: sort_changed tracked', { sortType, resultsCount });
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

  console.log('GA4: filters_cleared tracked', { previousFiltersCount, resultsCount });
};

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}