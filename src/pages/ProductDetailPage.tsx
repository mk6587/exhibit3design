
import { useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductGallery from "@/components/product/ProductGallery";
import AddToCartButton from "@/components/product/AddToCartButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  specifications: `
    <h4>Technical Specifications</h4>
    <ul>
      <li>Dimensions: 6m x 6m (customizable)</li>
      <li>Height: 3.5m</li>
      <li>Materials: Aluminum structure, MDF panels, glass shelving</li>
      <li>Required floor space: 36m²</li>
      <li>Setup time: Approximately 8 hours</li>
    </ul>
    
    <h4>File Formats</h4>
    <ul>
      <li>SketchUp (.skp) - SketchUp 2020 compatible</li>
      <li>3DS Max (.max) - 3DS Max 2019 compatible</li>
      <li>3D Studio (.3ds) - Universal 3D format</li>
      <li>PDF - Technical drawings and specifications</li>
    </ul>
  `,
  images: [
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg"
  ],
  tags: ["Modern", "SKP", "3DS", "MAX", "PDF"],
  fileFormats: ["SKP", "3DS", "MAX", "PDF"],
  fileSize: "258 MB",
  createdAt: "2023-05-12"
};

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  
  // In a real app, you'd fetch the product data based on the ID
  // For now, we'll just use our mock data
  const product = productData;
  
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
          <TabsList className="grid grid-cols-3 w-full md:w-fit">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="license">License</TabsTrigger>
          </TabsList>
          
          <div className="mt-6 p-6 border rounded-lg">
            <TabsContent value="overview">
              <div dangerouslySetInnerHTML={{ __html: product.longDescription }} />
            </TabsContent>
            
            <TabsContent value="specifications">
              <div dangerouslySetInnerHTML={{ __html: product.specifications }} />
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
