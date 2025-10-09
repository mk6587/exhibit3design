
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductGallery from "@/components/product/ProductGallery";
import { Button } from "@/components/ui/button";
import { Sparkles, Lock, ArrowRight } from "lucide-react";
import { useProducts } from "@/contexts/ProductsContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Check, X, FileText, Calendar, HardDrive, Download } from "lucide-react";
import "@/components/ui/rich-text-editor.css";
import { trackViewItem } from "@/services/ga4Analytics";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getProductById, loading } = useProducts();
  const [activeTab, setActiveTab] = useState("specifications");
  
  const product = getProductById(parseInt(id!));
  
  // Scroll to top when component mounts or product changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Track view_item when product loads
  useEffect(() => {
    if (product && !loading) {
      trackViewItem(product);
    }
  }, [product, loading]);
  
  // Parse specifications
  const parseSpecifications = (specs: string) => {
    try {
      return JSON.parse(specs);
    } catch {
      return {
        dimensions: '',
        height: '',
        layout: '',
        lighting: '',
        specifications: {}
      };
    }
  };

  const specifications = product ? parseSpecifications(product.specifications) : null;
  
  const facilityLabels = {
    infoDesk: "Info Desk",
    storage: "Storage",
    screen: "Screen",
    kitchen: "Kitchen",
    seatingArea: "Seating Area",
    meetingRoom: "Meeting Room",
    hangingBanner: "Hanging Banner",
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <p>The product you're looking for doesn't exist or has been removed.</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Product Gallery */}
          <div>
            <ProductGallery images={product.images} title={product.title} />
          </div>
          
          {/* Product Information */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            <div className="flex flex-wrap gap-1 mb-4">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
            
            {/* Subscription Tier Requirement */}
            {product.subscription_tier_required ? (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <span className="text-lg font-semibold">
                    {product.subscription_tier_required === 'sample' ? 'Free Sample' :
                     product.subscription_tier_required === 'basic' ? 'Requires Starter Plan' :
                     product.subscription_tier_required === 'standard' ? 'Requires Pro Plan' :
                     'Requires Studio Plan'}
                  </span>
                </div>
                <p className="text-muted-foreground mb-4">
                  This design is included in your {
                    product.subscription_tier_required === 'basic' ? 'Starter' :
                    product.subscription_tier_required === 'standard' ? 'Pro' :
                    'Studio'
                  } subscription or higher.
                </p>
              </div>
            ) : (
              <div className="mb-6">
                <Badge className="mb-3" variant="secondary">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Free Sample
                </Badge>
                <p className="text-muted-foreground">
                  This is a free sample design available to all users.
                </p>
              </div>
            )}
            
            {product.memo && (
              <div className="mb-6">
                <p className="text-foreground">{product.memo}</p>
              </div>
            )}
            
            {/* CTA Buttons */}
            <div className="space-y-3">
              <Button asChild size="lg" className="w-full">
                <Link to="/pricing">
                  {product.subscription_tier_required && product.subscription_tier_required !== 'sample' 
                    ? `Upgrade to Access` 
                    : 'Get Started Free'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full">
                <Link to="/ai-samples">
                  <Sparkles className="mr-2 h-4 w-4" />
                  See AI Customization Examples
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Product Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid grid-cols-2 w-full md:w-fit">
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="license">License</TabsTrigger>
          </TabsList>
          
          <div className="mt-6 p-6 border rounded-lg">
            <TabsContent value="specifications">
              <div className="space-y-8">
                {/* Specifications */}
                {specifications && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Physical Specifications</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableHead className="w-1/3 font-medium">Dimensions</TableHead>
                              <TableCell>{specifications.dimensions || 'Not specified'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableHead className="font-medium">Height</TableHead>
                              <TableCell>{specifications.height || 'Not specified'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableHead className="font-medium">Layout</TableHead>
                              <TableCell>{specifications.layout || 'Not specified'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableHead className="font-medium">Lighting</TableHead>
                              <TableCell>{specifications.lighting || 'Not specified'}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    {specifications.specifications && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Stand Specifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(facilityLabels).map(([key, label]) => (
                              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                                <span className="font-medium">{label}</span>
                                <div className="flex items-center">
                                  {specifications.specifications?.[key] ? (
                                    <div className="flex items-center text-green-600">
                                      <Check className="h-4 w-4 mr-1" />
                                      <span className="text-sm">Included</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-gray-400">
                                      <X className="h-4 w-4 mr-1" />
                                      <span className="text-sm">Not included</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader>
                        <CardTitle>Technical Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center">
                              <Download className="h-4 w-4 mr-2 text-green-600" />
                              <span className="font-medium">SketchUp Compatibility</span>
                            </div>
                            <span className="text-sm text-muted-foreground">2020+</span>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center">
                              <Download className="h-4 w-4 mr-2 text-red-600" />
                              <span className="font-medium">3DS Max Compatibility</span>
                            </div>
                            <span className="text-sm text-muted-foreground">2019+</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="license">
              <h3 className="font-bold mb-4">License Information</h3>
              <p className="mb-4">
                All design files come with a standard commercial license, allowing you to:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Use the design for commercial exhibition stands</li>
                <li>Modify the design to fit your needs</li>
                <li>Use the design for client work</li>
              </ul>
              <p className="mb-4">
                The license does not permit:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Reselling or redistributing the original design files</li>
                <li>Creating a competing product using these designs</li>
              </ul>
              <p>
                For extended license options, please <Link to="/contact" className="text-primary hover:underline">contact us</Link>.
              </p>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
