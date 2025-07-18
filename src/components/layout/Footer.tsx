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
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary">Home</Link></li>
              <li><Link to="/products" className="hover:text-primary">Browse Designs</Link></li>
              <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-primary">FAQ</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-primary">Login</Link></li>
              <li><Link to="/register" className="hover:text-primary">Register</Link></li>
              <li><Link to="/account/orders" className="hover:text-primary">My Orders</Link></li>
              <li><Link to="/account/downloads" className="hover:text-primary">My Downloads</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Phone: +44 7508 879096</h3>
            <address className="text-sm text-muted-foreground not-italic">
              
              <p>Phone: +1 (555) 123-4567</p>
            </address>
            <div className="mt-4 flex space-x-4">
              <a href="#" aria-label="Facebook" className="hover:text-primary">FB</a>
              <a href="#" aria-label="Twitter" className="hover:text-primary">TW</a>
              <a href="#" aria-label="Instagram" className="hover:text-primary">IG</a>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ExhibitDesigns. All rights reserved.</p>
        </div>
      </div>
    </footer>;
};
export default Footer;