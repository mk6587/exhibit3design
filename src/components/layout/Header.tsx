
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Search, User, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  return (
    <header className="border-b sticky top-0 bg-background z-40">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="font-bold text-xl text-primary">
          ExhibitDesigns
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/products" className="text-sm font-medium hover:text-primary">
            Browse Designs
          </Link>
          <Link to="/about" className="text-sm font-medium hover:text-primary">
            About Us
          </Link>
          <Link to="/contact" className="text-sm font-medium hover:text-primary">
            Contact
          </Link>
          <Link to="/faq" className="text-sm font-medium hover:text-primary">
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
          <Button variant="ghost" size="icon" asChild className="hidden md:flex">
            <Link to="/account">
              <User className="h-5 w-5" />
            </Link>
          </Button>

          {/* Cart */}
          <Button variant="ghost" size="icon" asChild>
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </Button>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "md:hidden bg-background absolute w-full border-b",
        isMenuOpen ? "block" : "hidden"
      )}>
        <nav className="container mx-auto px-4 py-4 flex flex-col space-y-3">
          <Link to="/products" className="p-2 hover:bg-muted rounded-md">
            Browse Designs
          </Link>
          <Link to="/about" className="p-2 hover:bg-muted rounded-md">
            About Us
          </Link>
          <Link to="/contact" className="p-2 hover:bg-muted rounded-md">
            Contact
          </Link>
          <Link to="/faq" className="p-2 hover:bg-muted rounded-md">
            FAQ
          </Link>
          <Link to="/account" className="p-2 hover:bg-muted rounded-md">
            My Account
          </Link>
        </nav>
      </div>

      {/* Search Bar */}
      <div className={cn(
        "border-b bg-background absolute w-full transition-all duration-200 ease-in-out",
        isSearchOpen ? "top-16" : "-top-20"
      )}>
        <div className="container mx-auto px-4 py-4">
          <form className="flex items-center">
            <Input 
              type="search" 
              placeholder="Search for designs..." 
              className="flex-1" 
            />
            <Button type="submit" className="ml-2">
              Search
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header;
