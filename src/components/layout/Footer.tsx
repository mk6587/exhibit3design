import { Link } from "react-router-dom";
const Footer = () => {
  return <footer className="bg-secondary mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">Exhibit3Designs</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Premium exhibition stand design files for professionals. 
              Find the perfect design for your next exhibition.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-1 text-sm">
              <li><Link to="/" className="block py-2 hover:text-primary transition-colors touch-manipulation">Home</Link></li>
              <li><Link to="/products" className="block py-2 hover:text-primary transition-colors touch-manipulation">Browse Designs</Link></li>
              <li><Link to="/about" className="block py-2 hover:text-primary transition-colors touch-manipulation">About Us</Link></li>
              <li><Link to="/contact" className="block py-2 hover:text-primary transition-colors touch-manipulation">Contact</Link></li>
              <li><Link to="/faq" className="block py-2 hover:text-primary transition-colors touch-manipulation">FAQ</Link></li>
              <li><Link to="/privacy-policy" className="block py-2 hover:text-primary transition-colors touch-manipulation">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Account</h3>
            <ul className="space-y-1 text-sm">
              <li><Link to="/auth" className="block py-2 hover:text-primary transition-colors touch-manipulation">Login</Link></li>
              <li><Link to="/auth" className="block py-2 hover:text-primary transition-colors touch-manipulation">Register</Link></li>
              <li><Link to="/profile" className="block py-2 hover:text-primary transition-colors touch-manipulation">My Orders</Link></li>
              <li><Link to="/downloads" className="block py-2 hover:text-primary transition-colors touch-manipulation">My Downloads</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <address className="text-sm text-muted-foreground not-italic">
              
              <p>Phone: <a href="https://wa.me/447508879096" target="_blank" rel="noopener noreferrer" className="inline-block py-1 hover:text-primary transition-colors touch-manipulation">+44 7508 879096</a></p>
            </address>
            
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Exhibit3Design. All rights reserved.</p>
        </div>
      </div>
    </footer>;
};
export default Footer;