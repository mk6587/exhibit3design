
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { useProducts } from '@/contexts/ProductsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Edit, Eye } from 'lucide-react';

const AdminPage = () => {
  const { isAuthenticated, logout } = useAdmin();
  const { products, loading } = useProducts();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Management</h2>
          <p className="text-gray-600">Manage your exhibition stand designs and content ({products.length} products total)</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <img 
                  src={product.images[0] || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop"} 
                  alt={product.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <CardTitle className="text-lg">{product.title}</CardTitle>
                <CardDescription>${product.price}</CardDescription>
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
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
