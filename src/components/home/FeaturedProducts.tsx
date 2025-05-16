
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const mockProducts = [
  {
    id: 1,
    title: "Modern Exhibition Stand",
    price: 149,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop",
    tags: ["Modern", "SKP", "3DS"],
  },
  {
    id: 2,
    title: "Corner Exhibition Booth",
    price: 199,
    image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=800&h=600&fit=crop",
    tags: ["Corner", "MAX", "PDF"],
  },
  {
    id: 3,
    title: "Island Exhibition Design",
    price: 249,
    image: "https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=800&h=600&fit=crop",
    tags: ["Island", "SKP", "3DS"],
  },
  {
    id: 4,
    title: "Minimalist Display Stand",
    price: 129,
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop",
    tags: ["Minimalist", "MAX", "PDF"],
  },
  {
    id: 5,
    title: "Interactive Booth Design",
    price: 299,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    tags: ["Interactive", "SKP", "MAX"],
  },
  {
    id: 6,
    title: "Luxury Exhibition Display",
    price: 349,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop",
    tags: ["Luxury", "3DS", "PDF"],
  },
];

const FeaturedProducts = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Designs</h2>
          <Link to="/products" className="text-primary hover:underline">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {mockProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden transition-shadow hover:shadow-lg">
              <Link to={`/product/${product.id}`}>
                <div className="aspect-[4/3] overflow-hidden bg-secondary">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              </Link>
              <CardContent className="pt-4">
                <Link to={`/product/${product.id}`} className="hover:underline">
                  <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                </Link>
                <div className="flex flex-wrap gap-1 mb-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <span className="font-semibold">${product.price}</span>
                <Link 
                  to={`/product/${product.id}`} 
                  className="text-primary hover:underline"
                >
                  View Details
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
