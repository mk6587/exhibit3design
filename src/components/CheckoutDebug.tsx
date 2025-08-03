import { useState, useEffect } from "react";

// Simple debug component to check if contexts are loading
const CheckoutDebug = () => {
  const [debug, setDebug] = useState<any>({});

  useEffect(() => {
    // Import and test all context hooks
    const checkContexts = async () => {
      try {
        const { useAuth } = await import('@/contexts/AuthContext');
        const { useProducts } = await import('@/contexts/ProductsContext');
        
        setDebug({
          authLoaded: true,
          productsLoaded: true,
          timestamp: Date.now()
        });
      } catch (error) {
        setDebug({
          error: error.message,
          timestamp: Date.now()
        });
      }
    };

    checkContexts();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'white', 
      padding: '10px', 
      border: '1px solid #ccc',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <pre>{JSON.stringify(debug, null, 2)}</pre>
    </div>
  );
};

export default CheckoutDebug;