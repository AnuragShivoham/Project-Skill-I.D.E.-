import { Terminal, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Terminal className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight">AMIT–BODHIT</span>
            <span className="text-xs text-muted-foreground font-mono">co-build system</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
          <a href="#ide" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            The IDE
          </a>
          <a href="#enforcement" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Enforcement
          </a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/submit-project">Start Building</Link>
          </Button>
        </div>

        <button 
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-4 animate-fade-in">
          <a href="#how-it-works" className="block text-sm text-muted-foreground hover:text-foreground">
            How It Works
          </a>
          <a href="#ide" className="block text-sm text-muted-foreground hover:text-foreground">
            The IDE
          </a>
          <a href="#enforcement" className="block text-sm text-muted-foreground hover:text-foreground">
            Enforcement
          </a>
          <a href="#pricing" className="block text-sm text-muted-foreground hover:text-foreground">
            Pricing
          </a>
          <div className="pt-4 border-t border-border space-y-2">
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button variant="hero" size="sm" className="w-full" asChild>
              <Link to="/submit-project">Start Building</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
