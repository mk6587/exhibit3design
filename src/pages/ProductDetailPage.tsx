import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductGallery from "@/components/product/ProductGallery";
import AddToCartButton from "@/components/product/AddToCartButton";
import { useProducts } from "@/contexts/ProductsContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, FileText, Calendar, HardDrive, Download } from "lucide-react";
import "@/components/ui/rich-text-editor.css";
import { trackViewItem } from "@/services/ga4Analytics";
const ProductDetailPage = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const {
    getProductById,
    loading
  } = useProducts();
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
    hangingBanner: "Hanging Banner"
  };
  if (loading) {
    return <Layout>
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
      </Layout>;
  }
  if (!product) {
    return <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <p>The product you're looking for doesn't exist or has been removed.</p>
        </div>
      </Layout>;
  }
  return <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Product Gallery */}
          <div className="animate-fade-in">
            <ProductGallery images={product.images} title={product.title} />
          </div>
          
          {/* Product Information */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-slide-up">
              {product.title}
            </h1>
            
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <Badge 
                  key={tag} 
                  variant="outline"
                  className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-all duration-300 animate-scale-in"
                  style={{ animationDelay: `${0.05 * index}s` }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              €{product.price}
            </div>
            
            {product.memo && (
              <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                <p className="text-foreground leading-relaxed">{product.memo}</p>
              </div>
            )}
            
            <AddToCartButton productId={product.id} productName={product.title} />
          </div>
        </div>
        
        {/* Product Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <TabsList className="grid grid-cols-2 w-full md:w-fit bg-muted/50 p-1">
            <TabsTrigger 
              value="specifications"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground transition-all duration-300"
            >
              Specifications
            </TabsTrigger>
            <TabsTrigger 
              value="license"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground transition-all duration-300"
            >
              License
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6 p-6 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm">
            <TabsContent value="specifications">
              <div className="space-y-8">
                {/* Specifications */}
                {specifications && <div className="space-y-6">
                    <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          Physical Specifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableHead className="w-1/3 font-medium">Dimensions</TableHead>
                              <TableCell>{specifications.dimensions || 'Not specified'}</TableCell>
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

                    {specifications.specifications && <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader>
                          <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Stand Specifications
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(facilityLabels).map(([key, label]) => (
                              <div 
                                key={key} 
                                className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-300 group"
                              >
                                <span className="font-medium group-hover:text-primary transition-colors">{label}</span>
                                <div className="flex items-center">
                                  {specifications.specifications?.[key] ? (
                                    <div className="flex items-center text-primary">
                                      <Check className="h-4 w-4 mr-1" />
                                      <span className="text-sm font-medium">Included</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-muted-foreground">
                                      <X className="h-4 w-4 mr-1" />
                                      <span className="text-sm">Not included</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>}

                    <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          Technical Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-300 group">
                            <div className="flex items-center">
                              <Download className="h-5 w-5 mr-2 text-primary group-hover:scale-110 transition-transform" />
                              <span className="font-medium">SketchUp Compatibility</span>
                            </div>
                            <span className="text-sm font-semibold text-primary">2020+</span>
                          </div>
                          
                          <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-300 group">
                            <div className="flex items-center">
                              <Download className="h-5 w-5 mr-2 text-accent group-hover:scale-110 transition-transform" />
                              <span className="font-medium">3DS Max Compatibility</span>
                            </div>
                            <span className="text-sm font-semibold text-accent">2019+</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                  </div>}
              </div>
            </TabsContent>
            
            <TabsContent value="license" className="space-y-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                License Information
              </h3>
              
              <div className="p-6 rounded-lg border border-primary/20 bg-primary/5">
                <h4 className="font-semibold text-lg mb-3 text-primary">What You Can Do</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span>Use the design for commercial exhibition stands</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span>Modify the design to fit your needs</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span>Use the design for client work</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg border border-destructive/20 bg-destructive/5">
                <h4 className="font-semibold text-lg mb-3 text-destructive">Restrictions</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <X className="h-5 w-5 mr-2 text-destructive flex-shrink-0 mt-0.5" />
                    <span>Reselling or redistributing the original design files</span>
                  </li>
                  <li className="flex items-start">
                    <X className="h-5 w-5 mr-2 text-destructive flex-shrink-0 mt-0.5" />
                    <span>Creating a competing product using these designs</span>
                  </li>
                </ul>
              </div>
              
              <p className="text-muted-foreground">
                For extended license options, please{' '}
                <Link to="/contact" className="text-primary hover:text-accent transition-colors font-medium underline">
                  contact us
                </Link>.
              </p>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>;
};
export default ProductDetailPage;