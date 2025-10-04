import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Search, User, Menu, X, LogOut, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/contexts/ProductsContext";
import { openAIStudio } from "@/utils/aiStudioAuth";
import { toast } from "@/hooks/use-toast";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const {
    user,
    signOut
  } = useAuth();
  const {
    cartItems
  } = useProducts();
  const navigate = useNavigate();
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const handleSignOut = async () => {
    try {
      setIsMenuOpen(false);
      await signOut();
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      
      // Force navigation after successful logout
      setTimeout(() => {
        navigate("/", { replace: true });
        window.location.reload(); // Force reload to clear all state
      }, 100);
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Signed out",
        description: "You have been logged out.",
      });
      // Navigate anyway even if there's an error
      setTimeout(() => {
        navigate("/", { replace: true });
        window.location.reload();
      }, 100);
    }
  };

  const handleAIStudioClick = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to access AI Studio",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    try {
      await openAIStudio(user.id, user.email || '');
      toast({
        title: "Opening AI Studio",
        description: "A new window will open with your AI Studio access",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open AI Studio. Please try again.",
        variant: "destructive"
      });
    }
  };
  return <header className="bg-background border-b border-border fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between min-h-16">
        <Link to="/" className="font-bold text-lg sm:text-xl text-primary shrink-0 flex items-center h-full">
          Exhibit3Design
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 h-full">
          <Link to="/products" className="text-sm font-medium hover:text-primary transition-all duration-150 hover:-translate-y-[1px] flex items-center h-full">Browse Designs</Link>
          <Link to="/contact" className="text-sm font-medium hover:text-primary transition-all duration-150 hover:-translate-y-[1px] flex items-center h-full">
            Custom Services
          </Link>
          <Link to="/about" className="text-sm font-medium hover:text-primary transition-all duration-150 hover:-translate-y-[1px] flex items-center h-full">
            About
          </Link>
          <Link to="/faq" className="text-sm font-medium hover:text-primary transition-all duration-150 hover:-translate-y-[1px] flex items-center h-full">
            FAQ
          </Link>
          
        </nav>
        
        {/* Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Search Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleSearch} className="hidden md:flex">
            <Search className="h-5 w-5" />
          </Button>

          {/* AI Studio Button */}
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleAIStudioClick}
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all"
          >
            <Sparkles className="h-4 w-4" />
            AI Studio
          </Button>

          {/* User Menu */}
          {user ? <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="hidden md:flex">
                <LogOut className="h-5 w-5" />
              </Button>
            </div> : <div className="hidden md:flex items-center space-x-2">
              <Button size="sm" asChild>
                <Link to="/auth">Login / Register</Link>
              </Button>
            </div>}

          {/* Cart */}
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartItems.length > 99 ? '99+' : cartItems.length}
                </span>}
            </Link>
          </Button>

          {/* AI Studio Mobile Icon */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleAIStudioClick}
            className="md:hidden relative hover:bg-muted flex items-center justify-center"
          >
            <svg width="0" height="0" className="absolute">
              <defs>
                <linearGradient id="ai-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#9333ea', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
            </svg>
            <Sparkles className="h-5 w-5" style={{ stroke: 'url(#ai-gradient)', fill: 'url(#ai-gradient)' }} />
          </Button>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn("md:hidden bg-background absolute w-full shadow-sm border-t border-flat-border z-50 left-0 right-0", isMenuOpen ? "block" : "hidden")}>
        <nav className="container mx-auto px-4 sm:px-6 py-2 flex flex-col">
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
          
          <button 
            onClick={() => {
              handleAIStudioClick();
              setIsMenuOpen(false);
            }} 
            className="mobile-nav-item bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all text-left flex items-center w-full font-semibold"
          >
            <Sparkles className="h-5 w-5 mr-3" />
            AI Studio
          </button>
          
          {user ? <>
              <Link to="/profile" className="mobile-nav-item hover:bg-flat-hover transition-colors flex items-center" onClick={() => setIsMenuOpen(false)}>
                <User className="h-5 w-5 mr-3" />
                My Profile
              </Link>
              <button onClick={handleSignOut} className="mobile-nav-item hover:bg-flat-hover transition-colors text-left flex items-center w-full">
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </button>
            </> : <>
              <Link to="/auth" className="mobile-nav-item hover:bg-flat-hover transition-colors" onClick={() => setIsMenuOpen(false)}>
                Login / Register
              </Link>
            </>}
        </nav>
      </div>

      {/* Search Bar */}
      <div className={cn("bg-background absolute w-full transition-all duration-200 ease-in-out left-0 right-0", isSearchOpen ? "top-16" : "-top-20")}>
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <form className="flex items-center gap-3">
            <Input type="search" placeholder="Search designs..." className="flex-1" />
            <Button type="submit" size="default">
              Search
            </Button>
          </form>
        </div>
      </div>
    </header>;
};
export default Header;