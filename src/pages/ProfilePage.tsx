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
import { Loader2, User, ShoppingBag, LogOut, Download, ShoppingCart } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Order {
  id: string;
  product_id: number;
  amount: number;
  status: string;
  payment_method: string | null;
  transaction_id: string | null;
  created_at: string;
  products: {
    title: string;
    images: string[];
  };
}

const ProfilePage = () => {
  const { user, profile, loading: authLoading, updateProfile, signOut } = useAuth();
  const { addToCart, products } = useProducts();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
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

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

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

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            products (
              title,
              images
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching orders:", error);
          toast({
            title: "Error",
            description: "Failed to load order history.",
            variant: "destructive",
          });
        } else {
          setOrders(data || []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const { error } = await updateProfile({
        first_name: firstName,
        last_name: lastName,
        country: country,
        city: city,
        phone_number: phoneNumber,
        address_line_1: addressLine1,
        state_region: stateRegion,
        postcode: postcode,
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update profile.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleRepurchase = (order: Order) => {
    const product = products.find(p => p.id === order.product_id);
    if (product) {
      addToCart(product, 1, false); // Add 1 quantity, suppress the default toast
      navigate('/cart');
      sonnerToast.success('Product added to cart for repurchase');
    } else {
      sonnerToast.error('Product not found');
    }
  };

  const handleDownload = (order: Order) => {
    if (order.status === 'completed') {
      navigate('/downloads');
    } else {
      sonnerToast.error('Payment must be completed before downloading');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!user || !profile) {
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
                Manage your profile and view your order history
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Order History
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

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>
                    View and manage your purchased design files.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start browsing our design collection to make your first purchase.
                      </p>
                      <Button onClick={() => navigate("/products")}>
                        Browse Products
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  {order.products.images[0] && (
                                    <img
                                      src={order.products.images[0]}
                                      alt={order.products.title}
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                  )}
                                  <div>
                                    <div className="font-medium">
                                      {order.products.title}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>${order.amount}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    order.status === "completed" ? "default" : "secondary"
                                  }
                                >
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(order.created_at)}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  {order.status === 'completed' ? (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleDownload(order)}
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </Button>
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      variant="default"
                                      onClick={() => handleRepurchase(order)}
                                    >
                                      <ShoppingCart className="h-4 w-4 mr-2" />
                                      Repurchase
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;