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

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const { cartItems, cartTotal } = useProducts();
  const [isProcessing, setIsProcessing] = useState(false);
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Contact & Shipping Information state
  const [contactInfo, setContactInfo] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    addressLine1: "",
    city: "",
    stateRegion: "",
    postcode: ""
  });
  
  useEffect(() => {
    // Redirect if cart is empty
    if (cartItems.length === 0) {
      navigate("/cart");
      toast.error("Your cart is empty");
    }
  }, [cartItems.length, navigate]);

  // Initialize contact info with user data if logged in
  useEffect(() => {
    if (user && profile) {
      setContactInfo({
        fullName: `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
        email: user.email || "",
        phoneNumber: profile.phone_number || "",
        addressLine1: profile.address_line_1 || "",
        city: profile.city || "",
        stateRegion: profile.state_region || "",
        postcode: profile.postcode || ""
      });
    } else if (user) {
      setContactInfo(prev => ({ ...prev, email: user.email || "" }));
    }
  }, [user, profile]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!contactInfo.fullName.trim()) errors.fullName = "Full name is required";
    if (!contactInfo.email.trim()) errors.email = "Email address is required";
    if (!contactInfo.phoneNumber.trim()) errors.phoneNumber = "Phone number is required";
    if (!contactInfo.addressLine1.trim()) errors.addressLine1 = "Address is required";
    if (!contactInfo.city.trim()) errors.city = "City is required";
    if (!contactInfo.stateRegion.trim()) errors.stateRegion = "State/Region is required";
    if (!contactInfo.postcode.trim()) errors.postcode = "Postcode is required";
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (contactInfo.email && !emailRegex.test(contactInfo.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveUserProfile = async () => {
    if (!user || !updateProfile) return;
    
    const names = contactInfo.fullName.trim().split(" ");
    const firstName = names[0] || "";
    const lastName = names.slice(1).join(" ") || "";
    
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone_number: contactInfo.phoneNumber,
        address_line_1: contactInfo.addressLine1,
        city: contactInfo.city,
        state_region: contactInfo.stateRegion,
        postcode: contactInfo.postcode
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
      // Prepare payment data for YekPay
      const paymentData = {
        amount: cartTotal,
        description: "Purchase from ExhibitDesigns",
        callbackUrl: `${window.location.origin}/payment/callback`,
        customerInfo: {
          email: contactInfo.email,
          fullName: contactInfo.fullName,
          phoneNumber: contactInfo.phoneNumber,
          address: {
            line1: contactInfo.addressLine1,
            city: contactInfo.city,
            state: contactInfo.stateRegion,
            postcode: contactInfo.postcode
          }
        },
        orderItems: cartItems.map(item => ({
          id: item.id,
          name: item.title,
          price: item.price,
          quantity: item.quantity
        }))
      };
      
      // Initiate payment
      const response = await initiatePayment(paymentData);
      
      // In a real app, redirect to YekPay's gateway
      if (response.success) {
        // Save user profile information if logged in
        await saveUserProfile();
        
        toast.info("Redirecting to payment gateway...");
        
        // Simulate redirect
        setTimeout(() => {
          // This would be a real redirect in production:
          // window.location.href = response.gatewayUrl;
          
          // For demo purposes, we'll just show a success message
          toast.success("Payment simulation successful!");
          navigate("/account/downloads");
        }, 2000);
      } else {
        throw new Error("Payment initiation failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment processing failed. Please try again.");
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
            
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between py-3 border-b last:border-0">
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <div className="font-medium">${item.price}</div>
              </div>
            ))}
            
            <div className="pt-4 mt-4 flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Contact & Shipping Information Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Contact & Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Returning Customer Info Display */}
              {user && profile && (
                profile.first_name || profile.phone_number || profile.address_line_1
              ) ? (
                <div className="p-4 bg-muted rounded-lg mb-4">
                  <p className="text-sm font-medium mb-2">Using your saved information:</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {contactInfo.fullName && <p>Name: {contactInfo.fullName}</p>}
                    {contactInfo.email && <p>Email: {contactInfo.email}</p>}
                    {contactInfo.phoneNumber && <p>Phone: {contactInfo.phoneNumber}</p>}
                    {contactInfo.addressLine1 && (
                      <p>Address: {contactInfo.addressLine1}, {contactInfo.city}, {contactInfo.stateRegion} {contactInfo.postcode}</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    You can update this information in your <Link to="/profile" className="text-primary hover:underline">Profile Settings</Link>
                  </p>
                </div>
              ) : null}

              {/* Contact Information Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={contactInfo.fullName}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                    className={validationErrors.fullName ? "border-destructive" : ""}
                  />
                  {validationErrors.fullName && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.fullName}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    className={validationErrors.email ? "border-destructive" : ""}
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={contactInfo.phoneNumber}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Enter your phone number"
                  className={validationErrors.phoneNumber ? "border-destructive" : ""}
                />
                {validationErrors.phoneNumber && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.phoneNumber}</p>
                )}
              </div>

              <div>
                <Label htmlFor="addressLine1">Address Line 1 *</Label>
                <Input
                  id="addressLine1"
                  value={contactInfo.addressLine1}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, addressLine1: e.target.value }))}
                  placeholder="Enter your street address"
                  className={validationErrors.addressLine1 ? "border-destructive" : ""}
                />
                {validationErrors.addressLine1 && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.addressLine1}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={contactInfo.city}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    className={validationErrors.city ? "border-destructive" : ""}
                  />
                  {validationErrors.city && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.city}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="stateRegion">State/Region *</Label>
                  <Input
                    id="stateRegion"
                    value={contactInfo.stateRegion}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, stateRegion: e.target.value }))}
                    placeholder="State/Region"
                    className={validationErrors.stateRegion ? "border-destructive" : ""}
                  />
                  {validationErrors.stateRegion && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.stateRegion}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="postcode">Postcode *</Label>
                  <Input
                    id="postcode"
                    value={contactInfo.postcode}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, postcode: e.target.value }))}
                    placeholder="Postcode"
                    className={validationErrors.postcode ? "border-destructive" : ""}
                  />
                  {validationErrors.postcode && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.postcode}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="border rounded-lg p-6 mb-8">
            <h2 className="font-semibold text-xl mb-4">Payment Information</h2>
            <p className="mb-6">
              You will be redirected to YekPay's secure payment gateway to complete your purchase.
              After successful payment, you will receive access to download your purchased designs.
            </p>
            
            <div className="flex items-start space-x-3 mb-4">
              <Checkbox 
                id="privacy-policy" 
                checked={policyAgreed} 
                onCheckedChange={(checked) => setPolicyAgreed(checked as boolean)}
              />
              <label 
                htmlFor="privacy-policy" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I have read and agree to the <Link to="/privacy-policy" className="text-primary hover:underline" target="_blank">Privacy Policy</Link>
              </label>
            </div>
            
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full"
            >
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