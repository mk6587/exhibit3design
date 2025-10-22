import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/contexts/ProductsContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, User, Activity, LogOut, Crown, FileText, CreditCard } from "lucide-react";
import { SubscriptionPanel } from "@/components/profile/SubscriptionPanel";
import { UsageHistory } from "@/components/profile/UsageHistory";
import { SelectedFiles } from "@/components/profile/SelectedFiles";
import { BillingHistory } from "@/components/profile/BillingHistory";
import { toast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { profileUpdateSchema } from "@/lib/validationSchemas";
import { trackPageView, trackProfileUpdate } from "@/services/ga4Analytics";
import { PageSkeleton } from "@/components/ui/page-skeleton";

const ProfilePage = () => {
  const { user, profile, loading: authLoading, updateProfile, signOut } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [postcode, setPostcode] = useState("");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);
  
  // Track page view
  useEffect(() => {
    if (user) {
      trackPageView('/profile', 'User Profile Dashboard');
    }
  }, [user]);

  // Initialize form fields
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setCountry(profile.country || "");
      setCity(profile.city || "");
      setPhoneNumber(profile.phone_number || "");
      setAddressLine1(profile.address_line_1 || "");
      setStateRegion(profile.state_region || "");
      setPostcode(profile.postcode || "");
    }
  }, [profile]);


  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      // Validate input with Zod
      const profileData = {
        firstName,
        lastName,
        phoneNumber,
        addressLine1,
        city,
        postcode,
        country
      };

      const validatedData = profileUpdateSchema.parse(profileData);

      const { error } = await updateProfile({
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        country: validatedData.country,
        city: validatedData.city,
        phone_number: validatedData.phoneNumber,
        address_line_1: validatedData.addressLine1,
        state_region: stateRegion,
        postcode: validatedData.postcode,
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update profile.",
          variant: "destructive",
        });
      } else {
        // Track profile update with changed fields
        const updatedFields = [];
        if (validatedData.firstName !== profile.first_name) updatedFields.push('first_name');
        if (validatedData.lastName !== profile.last_name) updatedFields.push('last_name');
        if (validatedData.country !== profile.country) updatedFields.push('country');
        if (validatedData.city !== profile.city) updatedFields.push('city');
        if (validatedData.phoneNumber !== profile.phone_number) updatedFields.push('phone_number');
        if (validatedData.addressLine1 !== profile.address_line_1) updatedFields.push('address');
        if (validatedData.postcode !== profile.postcode) updatedFields.push('postcode');
        
        if (updatedFields.length > 0) {
          trackProfileUpdate(updatedFields);
        }
      }
    } catch (error: any) {
      if (error.errors) {
        // Zod validation error
        const errorMessage = error.errors.map((err: any) => err.message).join(', ');
        toast({
          title: "Validation Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    console.log('ProfilePage: Logout button clicked');
    try {
      console.log('ProfilePage: Calling signOut...');
      await signOut();
      console.log('ProfilePage: SignOut successful, navigating...');
      toast({
        title: "Signed out successfully",
      });
      navigate("/", { replace: true });
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('ProfilePage: Sign out error:', error);
      toast({
        title: "Signed out",
        description: "Logging you out...",
      });
      navigate("/", { replace: true });
      window.location.reload();
    }
  };


  if (authLoading) {
    console.log('ProfilePage: Auth loading...');
    return (
      <Layout>
        <PageSkeleton />
      </Layout>
    );
  }

  console.log('ProfilePage: User:', user?.email, 'Profile:', !!profile);

  if (!user || !profile) {
    console.log('ProfilePage: No user or profile, redirecting to auth');
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Account</h1>
              <p className="text-muted-foreground">
                Manage your profile and track your usage
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setSearchParams({ tab: value })} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Subscription
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Files
              </TabsTrigger>
              <TabsTrigger value="usage" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Usage History
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and account information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Non-editable fields */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input value={user.email || ""} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input value="••••••••" type="password" disabled />
                      </div>
                    </div>
                    
                    <Separator />
                  </div>

                  {/* Editable profile form */}
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          disabled={updating}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          disabled={updating}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={updating}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressLine1">Address Line</Label>
                      <Textarea
                        id="addressLine1"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="Enter your address"
                        disabled={updating}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          disabled={updating}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          disabled={updating}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stateRegion">State/Region</Label>
                        <Input
                          id="stateRegion"
                          value={stateRegion}
                          onChange={(e) => setStateRegion(e.target.value)}
                          disabled={updating}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postcode">Postcode</Label>
                        <Input
                          id="postcode"
                          value={postcode}
                          onChange={(e) => setPostcode(e.target.value)}
                          disabled={updating}
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={updating}>
                      {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {updating ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription">
              <SubscriptionPanel />
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing">
              <BillingHistory />
            </TabsContent>

            {/* Selected Files Tab */}
            <TabsContent value="files">
              <SelectedFiles />
            </TabsContent>

            {/* Usage History Tab */}
            <TabsContent value="usage">
              <UsageHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;