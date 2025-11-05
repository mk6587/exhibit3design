import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Menu, X, LogOut, Sparkles, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/contexts/SessionContext";
import { AIStudioCTA, AIStudioCTAMobile } from "./AIStudioCTA";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useSession();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const handleLogin = () => {
    const { origin, pathname, search } = window.location;
    const clean = origin + pathname + search; // excludes window.location.hash
    window.location.href =
      `https://auth.exhibit3design.com/signin?return_to=${encodeURIComponent(clean)}`;
  };

  const handleLogout = () => {
    // POST to hosted auth logout endpoint
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://auth.exhibit3design.com/logout?return_to=https://exhibit3design.com';
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <header className="bg-background border-b border-border fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between min-h-16">
        <Link to="/" className="font-bold text-lg sm:text-xl text-primary shrink-0 flex items-center h-full">
          Exhibit3Design
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 h-full">
          <Link to="/ai-samples" className="text-sm font-medium hover:text-primary transition-all duration-150 hover:-translate-y-[1px] flex items-center h-full">AI Examples</Link>
          <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-all duration-150 hover:-translate-y-[1px] flex items-center h-full">Pricing</Link>
          <Link to="/products" className="text-sm font-medium hover:text-primary transition-all duration-150 hover:-translate-y-[1px] flex items-center h-full">Browse Designs</Link>
          <Link to="/contact" className="text-sm font-medium hover:text-primary transition-all duration-150 hover:-translate-y-[1px] flex items-center h-full">
            Custom Services
          </Link>
        </nav>
        
        {/* Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* AI Studio Button */}
          {user ? (
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="hidden md:flex items-center gap-1.5 hover:bg-muted px-2"
            >
              <a href="https://ai.exhibit3design.com" target="_blank" rel="noopener noreferrer">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  AI Studio
                </span>
              </a>
            </Button>
          ) : (
            <AIStudioCTA />
          )}

          {/* User Menu (Desktop) */}
          {user ? (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Button variant="default" size="sm" onClick={handleLogin} className="hidden md:inline-flex">
              <LogIn className="h-4 w-4 mr-2" />
              Login / Register
            </Button>
          )}

          {/* AI Studio Mobile Button */}
          {user ? (
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="md:hidden relative hover:bg-muted flex items-center gap-1 px-2"
            >
              <a href="https://ai.exhibit3design.com" target="_blank" rel="noopener noreferrer">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  AI Studio
                </span>
              </a>
            </Button>
          ) : (
            <AIStudioCTAMobile />
          )}

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn("md:hidden bg-background absolute w-full shadow-sm border-t border-flat-border z-50 left-0 right-0", isMenuOpen ? "block" : "hidden")}>
        <nav className="container mx-auto px-4 sm:px-6 py-2 flex flex-col">
          <Link to="/ai-samples" className="mobile-nav-item hover:bg-flat-hover transition-colors" onClick={() => setIsMenuOpen(false)}>
            AI Examples
          </Link>
          <Link to="/pricing" className="mobile-nav-item hover:bg-flat-hover transition-colors" onClick={() => setIsMenuOpen(false)}>
            Pricing
          </Link>
          <Link to="/products" className="mobile-nav-item hover:bg-flat-hover transition-colors" onClick={() => setIsMenuOpen(false)}>
            Browse Designs
          </Link>
          <Link to="/contact" className="mobile-nav-item hover:bg-flat-hover transition-colors" onClick={() => setIsMenuOpen(false)}>
            Custom Services
          </Link>
          <Link to="/about" className="mobile-nav-item hover:bg-flat-hover transition-colors" onClick={() => setIsMenuOpen(false)}>
            About
          </Link>
          <Link to="/faq" className="mobile-nav-item hover:bg-flat-hover transition-colors" onClick={() => setIsMenuOpen(false)}>
            FAQ
          </Link>
          
          <a
            href="https://ai.exhibit3design.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMenuOpen(false)} 
            className="mobile-nav-item bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all text-left flex items-center w-full font-semibold"
          >
            <Sparkles className="h-5 w-5 mr-3" />
            AI Studio
          </a>
          
          {user ? <>
              <Link to="/profile" className="mobile-nav-item hover:bg-flat-hover transition-colors flex items-center" onClick={() => setIsMenuOpen(false)}>
                <User className="h-5 w-5 mr-3" />
                My Profile
              </Link>
              <button onClick={handleLogout} className="mobile-nav-item hover:bg-flat-hover transition-colors text-left flex items-center w-full">
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </button>
            </> : <>
              <button onClick={handleLogin} className="mobile-nav-item hover:bg-flat-hover transition-colors flex items-center text-left w-full">
                <LogIn className="h-5 w-5 mr-3" />
                Login / Register
              </button>
              <Link to="/pricing" className="mobile-nav-item hover:bg-flat-hover transition-colors font-semibold text-primary" onClick={() => setIsMenuOpen(false)}>
                Get Started Free
              </Link>
            </>}
        </nav>
      </div>
    </header>
  );
};

export default Header;
