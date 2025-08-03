import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { initiatePayment } from "@/services/paymentService";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/contexts/ProductsContext";
import { supabase } from "@/integrations/supabase/client";
import { trackBeginCheckout, trackAddShippingInfo, trackAddPaymentInfo } from "@/services/ga4Analytics";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const { cartItems, cartTotal } = useProducts();
  const [isProcessing, setIsProcessing] = useState(false);
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Customer Information for Stripe
  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  useEffect(() => {
    // Check authentication first, then cart
    if (!user) {
      toast.error("Please login to continue with checkout");
      navigate('/auth');
      return;
    }
    
    // Only check cart if user is authenticated
    if (cartItems.length === 0) {
      navigate("/cart");
      toast.error("Your cart is empty");
      return;
    }

    // Track begin_checkout when checkout page loads
    trackBeginCheckout(cartItems, cartTotal);
  }, [cartItems.length, navigate, user, cartItems, cartTotal]);

  // Initialize customer info with user data if logged in
  useEffect(() => {
    if (user && profile) {
      setCustomerInfo({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        email: user.email || "",
        mobile: profile.phone_number || "",
        address: profile.address_line_1 || "",
        city: profile.city || "",
        postalCode: profile.postcode || "",
        country: profile.country || "",
      });
    } else if (user) {
      setCustomerInfo(prev => ({
        ...prev,
        email: user.email || ""
      }));
    }
  }, [user, profile]);

  // Track shipping info when customer info is filled
  useEffect(() => {
    if (customerInfo.address && customerInfo.city && customerInfo.country) {
      trackAddShippingInfo(cartItems, cartTotal, 'Digital');
    }
  }, [customerInfo.address, customerInfo.city, customerInfo.country, cartItems, cartTotal]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!customerInfo.firstName.trim()) errors.firstName = "First name is required";
    if (!customerInfo.lastName.trim()) errors.lastName = "Last name is required";
    if (!customerInfo.email.trim()) errors.email = "Email address is required";
    if (!customerInfo.mobile.trim()) errors.mobile = "Mobile number is required";
    if (!customerInfo.address.trim()) errors.address = "Address is required";
    if (!customerInfo.city.trim()) errors.city = "City is required";
    if (!customerInfo.postalCode.trim()) errors.postalCode = "Postal code is required";
    if (!customerInfo.country.trim()) errors.country = "Country is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (customerInfo.email && !emailRegex.test(customerInfo.email)) {
      errors.email = "Please enter a valid email address";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveUserProfile = async () => {
    if (!user || !updateProfile || !profile) return;
    
    // Check if any profile data has actually changed
    const hasChanges = 
      customerInfo.firstName !== (profile.first_name || "") ||
      customerInfo.lastName !== (profile.last_name || "") ||
      customerInfo.mobile !== (profile.phone_number || "") ||
      customerInfo.address !== (profile.address_line_1 || "") ||
      customerInfo.city !== (profile.city || "") ||
      customerInfo.postalCode !== (profile.postcode || "") ||
      customerInfo.country !== (profile.country || "");
    
    // Only update if there are actual changes
    if (!hasChanges) {
      console.log("No profile changes detected, skipping update");
      return;
    }
    
    try {
      console.log("Updating profile with new information");
      await updateProfile({
        first_name: customerInfo.firstName,
        last_name: customerInfo.lastName,
        phone_number: customerInfo.mobile,
        address_line_1: customerInfo.address,
        city: customerInfo.city,
        postcode: customerInfo.postalCode,
        country: customerInfo.country
      });
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required information");
      return;
    }
    if (!policyAgreed) {
      toast.error("You must agree to our Privacy Policy to proceed with the payment");
      return;
    }

    setIsProcessing(true);
    try {
      // Track payment info event
      trackAddPaymentInfo(cartItems, cartTotal, 'Stripe');

      // Prepare payment data for Stripe
      const paymentData = {
        amount: cartTotal,
        description: `Purchase of ${cartItems.length} design(s) from Exhibit3Design`,
        customerInfo: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          mobile: customerInfo.mobile,
          address: customerInfo.address,
          postalCode: customerInfo.postalCode,
          country: customerInfo.country,
          city: customerInfo.city,
        },
        orderItems: cartItems.map(item => ({
          id: item.id,
          name: item.title,
          price: item.price,
          quantity: item.quantity
        }))
      };

      // Save user profile information before payment
      await saveUserProfile();

      // Create Stripe payment using fetch API
      const response = await initiatePayment(paymentData);

      if (response.success) {
        // Form submission handles the redirect automatically
        toast.success(response.message || "Payment initiated successfully");
        // The form.submit() will redirect the user to the payment gateway
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment setup failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          
          <div className="bg-secondary p-6 rounded-lg mb-8">
            <h2 className="font-semibold text-xl mb-4">Order Summary</h2>
            
            {cartItems.map(item => <div key={item.id} className="flex justify-between py-3 border-b last:border-0">
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <div className="font-medium">€{item.price}</div>
              </div>)}
            
            <div className="pt-4 mt-4 flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>€{cartTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Contact & Shipping Information Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Returning Customer Info Display */}
              {user && profile && (profile.first_name || profile.phone_number || profile.address_line_1) ? <div className="p-4 bg-muted rounded-lg mb-4">
                  <p className="text-sm font-medium mb-2">Using your saved information:</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {customerInfo.firstName && <p>Name: {customerInfo.firstName} {customerInfo.lastName}</p>}
                    {customerInfo.email && <p>Email: {customerInfo.email}</p>}
                    {customerInfo.mobile && <p>Phone: {customerInfo.mobile}</p>}
                    {customerInfo.address && <p>Address: {customerInfo.address}, {customerInfo.city}, {customerInfo.postalCode} {customerInfo.country}</p>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    You can update this information in your <Link to="/profile" className="text-primary hover:underline">Profile Settings</Link>
                  </p>
                </div> : null}

              {/* Customer Information Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input 
                    id="firstName" 
                    value={customerInfo.firstName} 
                    onChange={e => setCustomerInfo(prev => ({
                      ...prev,
                      firstName: e.target.value
                    }))} 
                    placeholder="Enter your first name" 
                    className={validationErrors.firstName ? "border-destructive" : ""} 
                  />
                  {validationErrors.firstName && <p className="text-sm text-destructive mt-1">{validationErrors.firstName}</p>}
                </div>
                
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input 
                    id="lastName" 
                    value={customerInfo.lastName} 
                    onChange={e => setCustomerInfo(prev => ({
                      ...prev,
                      lastName: e.target.value
                    }))} 
                    placeholder="Enter your last name" 
                    className={validationErrors.lastName ? "border-destructive" : ""} 
                  />
                  {validationErrors.lastName && <p className="text-sm text-destructive mt-1">{validationErrors.lastName}</p>}
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={customerInfo.email} 
                    onChange={e => setCustomerInfo(prev => ({
                      ...prev,
                      email: e.target.value
                    }))} 
                    placeholder="Enter your email" 
                    className={validationErrors.email ? "border-destructive" : ""} 
                    readOnly={!!user}
                    disabled={!!user}
                  />
                  {user && <p className="text-xs text-muted-foreground mt-1">Email cannot be changed (from your account)</p>}
                  {validationErrors.email && <p className="text-sm text-destructive mt-1">{validationErrors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input 
                    id="mobile" 
                    value={customerInfo.mobile} 
                    onChange={e => setCustomerInfo(prev => ({
                      ...prev,
                      mobile: e.target.value
                    }))} 
                    placeholder="+44123456789" 
                    className={validationErrors.mobile ? "border-destructive" : ""} 
                  />
                  {validationErrors.mobile && <p className="text-sm text-destructive mt-1">{validationErrors.mobile}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Input 
                  id="address" 
                  value={customerInfo.address} 
                  onChange={e => setCustomerInfo(prev => ({
                    ...prev,
                    address: e.target.value
                  }))} 
                  placeholder="Enter your full address" 
                  className={validationErrors.address ? "border-destructive" : ""} 
                />
                {validationErrors.address && <p className="text-sm text-destructive mt-1">{validationErrors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input 
                    id="city" 
                    value={customerInfo.city} 
                    onChange={e => setCustomerInfo(prev => ({
                      ...prev,
                      city: e.target.value
                    }))} 
                    placeholder="City" 
                    className={validationErrors.city ? "border-destructive" : ""} 
                  />
                  {validationErrors.city && <p className="text-sm text-destructive mt-1">{validationErrors.city}</p>}
                </div>
                
                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input 
                    id="postalCode" 
                    value={customerInfo.postalCode} 
                    onChange={e => setCustomerInfo(prev => ({
                      ...prev,
                      postalCode: e.target.value
                    }))} 
                    placeholder="Postal Code" 
                    className={validationErrors.postalCode ? "border-destructive" : ""} 
                  />
                  {validationErrors.postalCode && <p className="text-sm text-destructive mt-1">{validationErrors.postalCode}</p>}
                </div>
                
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input 
                    id="country" 
                    value={customerInfo.country} 
                    onChange={e => setCustomerInfo(prev => ({
                      ...prev,
                      country: e.target.value
                    }))} 
                    placeholder="US, UK, TR, etc." 
                    className={validationErrors.country ? "border-destructive" : ""} 
                  />
                  {validationErrors.country && <p className="text-sm text-destructive mt-1">{validationErrors.country}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="border rounded-lg p-6 mb-8">
            <h2 className="font-semibold text-xl mb-4">Payment Information</h2>
            <p className="mb-6">
              You will be redirected to Stripe's secure payment gateway to complete your purchase.
              After successful payment, you will receive access to download your purchased designs.
            </p>
            
            <div className="flex items-start space-x-3 mb-4">
              <Checkbox id="privacy-policy" checked={policyAgreed} onCheckedChange={checked => setPolicyAgreed(checked as boolean)} />
              <label htmlFor="privacy-policy" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                I have read and agree to the <Link to="/privacy-policy" className="text-primary hover:underline" target="_blank">Privacy Policy</Link>
              </label>
            </div>
            
            <Button onClick={handlePayment} disabled={isProcessing} className="w-full">
              {isProcessing ? "Processing..." : "Proceed to Payment"}
            </Button>
            
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Your payment is secure and encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default CheckoutPage;