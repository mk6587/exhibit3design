import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, User, Menu, X, LogOut, Sparkles, Coins } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/contexts/ProductsContext";
import { openAIStudio } from "@/utils/aiStudioAuth";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { AIStudioCTA, AIStudioCTAMobile } from "./AIStudioCTA";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const {
    user,
    profile,
    signOut
  } = useAuth();
  // Removed cartItems - using subscription model now
  const navigate = useNavigate();

  // Get token balances from profile
  const aiTokens = profile?.ai_tokens_balance || 0;
  const videoSeconds = profile?.video_seconds_balance || 0;
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const handleSignOut = async () => {
    console.log('Logout button clicked');
    setIsMenuOpen(false);
    
    try {
      console.log('Calling signOut...');
      await signOut();
      console.log('SignOut successful');
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      
      // Navigate to home and reload
      navigate("/", { replace: true });
      window.location.reload();
    } catch (error) {
      console.error('Sign out error:', error);
      
      // Still show success message and reload since local state is cleared
      toast({
        title: "Signed out",
        description: "You have been logged out.",
      });
      
      navigate("/", { replace: true });
      window.location.reload();
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
          <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-all duration-150 hover:-translate-y-[1px] flex items-center h-full">Pricing</Link>
          <Link to="/ai-samples" className="text-sm font-medium hover:text-primary transition-all duration-150 hover:-translate-y-[1px] flex items-center h-full">AI Examples</Link>
          <Link to="/contact" className="text-sm font-medium hover:text-primary transition-all duration-150 hover:-translate-y-[1px] flex items-center h-full">
            Custom Services
          </Link>
        </nav>
        
        {/* Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Search Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleSearch} className="hidden md:flex">
            <Search className="h-5 w-5" />
          </Button>

          {/* AI Studio Button with Token Balance or CTA */}
          {user ? (
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleAIStudioClick}
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Studio</span>
              {profile && (
                <Badge variant="secondary" className="ml-1 bg-white/20 text-white border-0 hover:bg-white/30">
                  {aiTokens}
                </Badge>
              )}
            </Button>
          ) : (
            <AIStudioCTA />
          )}

          {/* User Menu */}
          {user && (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="hidden md:flex">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Cart removed - subscription model */}

          {/* AI Studio Mobile Button */}
          {user ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleAIStudioClick}
              className="md:hidden relative hover:bg-muted flex items-center gap-1 px-2"
            >
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                AI Studio
              </span>
              {profile && aiTokens > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-1 h-5 min-w-5 flex items-center justify-center p-0 px-1 text-[10px] bg-purple-600 text-white border-0"
                >
                  {aiTokens}
                </Badge>
              )}
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
          {/* Token Counter - Mobile */}
          {user && profile && (
            <div className="py-3 px-4 bg-primary/10 rounded-lg border border-primary/20 mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">Your Balance:</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold">
                  <span className="text-primary">{aiTokens} tokens</span>
                  {videoSeconds > 0 && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-primary">{videoSeconds}s</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <Link to="/products" className="mobile-nav-item hover:bg-flat-hover transition-colors" onClick={() => setIsMenuOpen(false)}>
            Browse Designs
          </Link>
          <Link to="/pricing" className="mobile-nav-item hover:bg-flat-hover transition-colors" onClick={() => setIsMenuOpen(false)}>
            Pricing
          </Link>
          <Link to="/ai-samples" className="mobile-nav-item hover:bg-flat-hover transition-colors" onClick={() => setIsMenuOpen(false)}>
            AI Examples
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
              <Link to="/pricing" className="mobile-nav-item hover:bg-flat-hover transition-colors font-semibold text-primary" onClick={() => setIsMenuOpen(false)}>
                Get 5 Free Tokens
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