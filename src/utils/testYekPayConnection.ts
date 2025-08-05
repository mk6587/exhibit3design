// Utility to test YekPay endpoint connectivity
export const testYekPayConnection = async () => {
  try {
    console.log("🔍 Testing YekPay endpoint connectivity...");
    
    // Test basic connectivity with a simple request
    const response = await fetch('https://pay.exhibit3design.com/yekpay.php', {
      method: 'OPTIONS',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log("✅ YekPay endpoint is reachable");
    console.log("📊 Response status:", response.status);
    console.log("📋 Response headers:", Object.fromEntries(response.headers.entries()));
    
    return {
      success: true,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    };
    
  } catch (error) {
    console.error("❌ YekPay endpoint connectivity test failed:");
    console.error("   Error type:", error?.constructor?.name);
    console.error("   Error message:", error instanceof Error ? error.message : String(error));
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      errorType: error?.constructor?.name
    };
  }
};