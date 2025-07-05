
import { useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductGallery from "@/components/product/ProductGallery";
import AddToCartButton from "@/components/product/AddToCartButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Check, X, FileText, Download, Calendar, HardDrive } from "lucide-react";

// Mock product data
const productData = {
  id: 1,
  title: "Modern Exhibition Stand Design",
  price: 149,
  description: "A modern exhibition stand design perfect for showcasing your products at trade shows and exhibitions. This design features a clean, contemporary aesthetic with ample display space.",
  longDescription: `
    <p>This modern exhibition stand design is perfect for businesses looking to make an impact at trade shows and exhibitions. The design features a clean, contemporary aesthetic with ample display space.</p>
    
    <p>Key features include:</p>
    <ul>
      <li>Open layout with multiple product display areas</li>
      <li>Integrated lighting system</li>
      <li>Reception counter and meeting space</li>
      <li>Storage area for marketing materials and personal items</li>
      <li>Customizable graphics panels</li>
    </ul>
    
    <p>The design is versatile and can be adapted to various exhibition spaces, making it an excellent investment for businesses that regularly attend trade shows.</p>
  `,
  specifications: JSON.stringify({
    dimensions: "6m x 4m",
    height: "3.5m",
    layout: "2-sided open",
    lighting: "LED spotlights with track lighting",
    specifications: {
      infoDesk: true,
      storage: true,
      screen: true,
      kitchen: false,
      seatingArea: true,
      meetingRoom: false,
      hangingBanner: true,
    }
  }),
  images: [
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop"
  ],
  tags: ["Modern", "SKP", "3DS", "MAX", "PDF"],
  fileFormats: ["SKP", "3DS", "MAX", "PDF"],
  fileSize: "258 MB",
  createdAt: "2023-05-12"
};

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("specifications");
  
  // In a real app, you'd fetch the product data based on the ID
  // For now, we'll just use our mock data
  const product = productData;
  
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

  const specifications = parseSpecifications(product.specifications);
  
  const facilityLabels = {
    infoDesk: "Info Desk",
    storage: "Storage",
    screen: "Screen",
    kitchen: "Kitchen",
    seatingArea: "Seating Area",
    meetingRoom: "Meeting Room",
    hangingBanner: "Hanging Banner",
  };
  
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
            
            <div className="text-2xl font-semibold mb-4">${product.price}</div>
            
            <p className="text-muted-foreground mb-6">
              {product.description}
            </p>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">File Formats Included:</h3>
              <div className="flex flex-wrap gap-2">
                {product.fileFormats.map((format) => (
                  <Badge key={format} variant="secondary">
                    {format}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div>File Size: {product.fileSize}</div>
                <div>Published: {new Date(product.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            
            <AddToCartButton productId={product.id} productName={product.title} />
            
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                Preview Files
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
                {/* Description Overview - without title */}
                <div>
                  <div dangerouslySetInnerHTML={{ __html: product.longDescription }} />
                </div>
                
                {/* Specifications */}
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

                  <Card>
                    <CardHeader>
                      <CardTitle>File Formats & Technical Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold mb-3">File Formats Included</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {product.fileFormats.map((format) => (
                              <div key={format} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 mr-2 text-blue-600" />
                                  <span className="font-medium">{format}</span>
                                </div>
                                <div className="flex items-center text-green-600">
                                  <Check className="h-4 w-4 mr-1" />
                                  <span className="text-sm">Included</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-3">Technical Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center">
                                <HardDrive className="h-4 w-4 mr-2 text-purple-600" />
                                <span className="font-medium">File Size</span>
                              </div>
                              <span className="text-sm text-muted-foreground">{product.fileSize}</span>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-orange-600" />
                                <span className="font-medium">Published</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {new Date(product.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                For extended license options, please <a href="/contact" className="text-primary hover:underline">contact us</a>.
              </p>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
