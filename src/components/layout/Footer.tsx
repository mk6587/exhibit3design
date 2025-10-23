import { Link } from "react-router-dom";
const Footer = () => {
  return <footer className="bg-secondary mt-auto relative z-10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">Exhibit3Designs</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Access ready-made exhibition stand designs and powerful AI tools — a complete subscription platform for professionals who want to create faster and smarter.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link to="/" className="block py-3 px-2 -mx-2 hover:text-primary hover:bg-muted/50 rounded transition-all duration-200 min-h-[44px] flex items-center relative z-20" style={{
                WebkitTapHighlightColor: 'transparent'
              }}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="block py-3 px-2 -mx-2 hover:text-primary hover:bg-muted/50 rounded transition-all duration-200 min-h-[44px] flex items-center relative z-20" style={{
                WebkitTapHighlightColor: 'transparent'
              }}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="block py-3 px-2 -mx-2 hover:text-primary hover:bg-muted/50 rounded transition-all duration-200 min-h-[44px] flex items-center relative z-20" style={{
                WebkitTapHighlightColor: 'transparent'
              }}>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="block py-3 px-2 -mx-2 hover:text-primary hover:bg-muted/50 rounded transition-all duration-200 min-h-[44px] flex items-center relative z-20" style={{
                WebkitTapHighlightColor: 'transparent'
              }}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="block py-3 px-2 -mx-2 hover:text-primary hover:bg-muted/50 rounded transition-all duration-200 min-h-[44px] flex items-center relative z-20" style={{
                WebkitTapHighlightColor: 'transparent'
              }}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Account</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link to="/auth" className="block py-3 px-2 -mx-2 hover:text-primary hover:bg-muted/50 rounded transition-all duration-200 min-h-[44px] flex items-center relative z-20" style={{
                WebkitTapHighlightColor: 'transparent'
              }}>Login / Register</Link>
              </li>
              <li>
                <Link to="/ai-samples" className="block py-3 px-2 -mx-2 hover:text-primary hover:bg-muted/50 rounded transition-all duration-200 min-h-[44px] flex items-center relative z-20" style={{
                WebkitTapHighlightColor: 'transparent'
              }}>AI Examples</Link>
              </li>
              <li>
                <Link to="/pricing" className="block py-3 px-2 -mx-2 hover:text-primary hover:bg-muted/50 rounded transition-all duration-200 min-h-[44px] flex items-center relative z-20" style={{
                WebkitTapHighlightColor: 'transparent'
              }}>
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/profile" className="block py-3 px-2 -mx-2 hover:text-primary hover:bg-muted/50 rounded transition-all duration-200 min-h-[44px] flex items-center relative z-20" style={{
                WebkitTapHighlightColor: 'transparent'
              }}>
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/academy" className="block py-3 px-2 -mx-2 hover:text-primary hover:bg-muted/50 rounded transition-all duration-200 min-h-[44px] flex items-center relative z-20" style={{
                WebkitTapHighlightColor: 'transparent'
              }}>
                  Academy
                </Link>
              </li>
            </ul>
          </div>
          
          
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Exhibit3Design. All rights reserved.</p>
        </div>
      </div>
    </footer>;
};
export default Footer;