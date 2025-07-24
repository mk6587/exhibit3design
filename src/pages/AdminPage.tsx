
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { useProducts } from '@/contexts/ProductsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ProductFilters, FilterConfig, ActiveFilters, defaultFilterConfig } from '@/components/admin/ProductFilters';
import { MigrateFiltersButton } from '@/components/admin/MigrateFiltersButton';
import { LogOut, Edit, Eye, Trash2 } from 'lucide-react';
import { Product } from '@/types/product';
import { extractFiltersFromTags } from '@/utils/filterRecognition';

const AdminPage = () => {
  const { isAuthenticated, logout } = useAdmin();
  const { products, loading, deleteProduct } = useProducts();
  const navigate = useNavigate();
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>(defaultFilterConfig);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    standSizes: [],
    standTypes: [],
    keyFeatures: [],
    standStyles: [],
    priceRange: defaultFilterConfig.priceRange
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      setDeletingProductId(productId);
      await deleteProduct(productId);
    } catch (error) {
      console.error('Failed to delete product:', error);
    } finally {
      setDeletingProductId(null);
    }
  };

  const filterProducts = (products: Product[]): Product[] => {
    return products.filter(product => {
      try {
        // Price filter
        const price = Number(product.price);
        if (isNaN(price) || price < activeFilters.priceRange[0] || price > activeFilters.priceRange[1]) {
          return false;
        }

        // Extract filters from product tags
        const productFilters = extractFiltersFromTags(product.tags);

        // Stand size filter
        if (activeFilters.standSizes.length > 0) {
          const hasMatchingSize = activeFilters.standSizes.some(size => 
            productFilters.standSize.includes(size)
          );
          if (!hasMatchingSize) return false;
        }

        // Stand type filter
        if (activeFilters.standTypes.length > 0) {
          const hasMatchingType = activeFilters.standTypes.some(type => 
            productFilters.standType.includes(type)
          );
          if (!hasMatchingType) return false;
        }

        // Key features filter
        if (activeFilters.keyFeatures.length > 0) {
          const hasMatchingFeature = activeFilters.keyFeatures.some(feature => 
            productFilters.keyFeatures.includes(feature)
          );
          if (!hasMatchingFeature) return false;
        }

        // Stand style filter
        if (activeFilters.standStyles.length > 0) {
          const hasMatchingStyle = activeFilters.standStyles.some(style => 
            productFilters.standStyle.includes(style)
          );
          if (!hasMatchingStyle) return false;
        }

        return true;
      } catch (error) {
        console.error('Error filtering product:', product.id, error);
        return false; // Exclude products that cause errors
      }
    });
  };

  const filteredProducts = filterProducts(products);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Management</h2>
              <p className="text-gray-600">
                Manage your exhibition stand designs and content 
                ({filteredProducts.length} of {products.length} products shown)
              </p>
            </div>
            <div className="flex gap-2">
              <MigrateFiltersButton />
              <Button asChild>
                <Link to="/admin/product/new">
                  Add New Product
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <ProductFilters
            filterConfig={filterConfig}
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
            onConfigChange={setFilterConfig}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <img 
                  src={product.images[0] || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop"} 
                  alt={product.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <CardTitle className="text-lg">{product.title}</CardTitle>
                <CardDescription>€{product.price}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full" variant="outline">
                  <Link to={`/product/${product.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Product
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to={`/admin/product/${product.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Content
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      disabled={deletingProductId === product.id}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deletingProductId === product.id ? 'Deleting...' : 'Delete Product'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the product "{product.title}" and remove all its data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Product
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
