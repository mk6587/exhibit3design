import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Search, User, Menu, X, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/contexts/ProductsContext";
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
    await signOut();
    navigate("/");
    setIsMenuOpen(false);
  };
  return <header className="bg-background z-40 sticky top-0">
      <div className="container mx-auto px-6 flex justify-between items-center h-16">
        <Link to="/" className="font-bold text-xl text-primary">
          Exhibit3Design
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/products" className="text-sm font-medium hover:text-primary transition-all duration-150 hover:-translate-y-[1px]">Browse Designs</Link>
          <Link to="/contact" className="text-sm font-medium hover:text-primary transition-all duration-150 hover:-translate-y-[1px]">
            Custom Services
          </Link>
          <Link to="/about" className="text-sm font-medium hover:text-primary transition-all duration-150 hover:-translate-y-[1px]">
            About
          </Link>
          <Link to="/faq" className="text-sm font-medium hover:text-primary transition-all duration-150 hover:-translate-y-[1px]">
            FAQ
          </Link>
        </nav>
        
        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Search Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleSearch} className="hidden md:flex">
            <Search className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          {user ? <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
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

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn("md:hidden bg-background absolute w-full border-b border-border", isMenuOpen ? "block" : "hidden")}>
        <nav className="container mx-auto px-6 py-6 flex flex-col space-y-2">
          <Link to="/products" className="p-3 hover:bg-muted rounded-sm transition-colors">
            €10 Designs
          </Link>
          <Link to="/contact" className="p-3 hover:bg-muted rounded-sm transition-colors">
            Custom Services
          </Link>
          <Link to="/about" className="p-3 hover:bg-muted rounded-sm transition-colors">
            About
          </Link>
          <Link to="/faq" className="p-3 hover:bg-muted rounded-sm transition-colors" onClick={() => setIsMenuOpen(false)}>
            FAQ
          </Link>
          
          {user ? <>
              <Link to="/profile" className="p-3 hover:bg-muted rounded-sm flex items-center transition-colors" onClick={() => setIsMenuOpen(false)}>
                <User className="h-4 w-4 mr-2" />
                My Profile
              </Link>
              <button onClick={handleSignOut} className="p-3 hover:bg-muted rounded-sm text-left flex items-center w-full transition-colors">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </> : <>
              <Link to="/auth" className="p-3 hover:bg-muted rounded-sm transition-colors" onClick={() => setIsMenuOpen(false)}>
                Login / Register
              </Link>
            </>}
        </nav>
      </div>

      {/* Search Bar */}
      <div className={cn("border-b border-border bg-background absolute w-full transition-all duration-200 ease-in-out", isSearchOpen ? "top-16" : "-top-20")}>
        <div className="container mx-auto px-6 py-6">
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