// Utility to test YekPay endpoint connectivity
export const testYekPayConnection = async () => {
  try {
    console.log("🔍 Testing YekPay endpoint connectivity...");
    
    // Test with a minimal POST request similar to the actual payment flow
    const testFormData = new FormData();
    testFormData.append('test_connection', '1');
    
    const response = await fetch('https://pay.exhibit3design.com/yekpay.php', {
      method: 'POST',
      body: testFormData,
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });
    
    console.log("✅ YekPay endpoint is reachable");
    console.log("📊 Response status:", response.status);
    console.log("📋 Response headers:", Object.fromEntries(response.headers.entries()));
    
    // Try to read response body
    let responseText = '';
    try {
      responseText = await response.text();
      console.log("📄 Response body:", responseText);
    } catch (textError) {
      console.log("📄 Could not read response body:", textError);
    }
    
    return {
      success: true,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      responseBody: responseText
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