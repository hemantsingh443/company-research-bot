
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-6">
      <div className="glass-card rounded-2xl p-12 text-center max-w-lg animate-fade-in">
        <h1 className="text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">404</h1>
        <p className="text-xl text-foreground mb-8">This page could not be found.</p>
        <Button asChild className="group transition-all duration-300">
          <a href="/" className="inline-flex items-center">
            <ArrowLeft size={18} className="mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
            Return to Home
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
