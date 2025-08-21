import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Zap, Plus, Calendar, TrendingUp, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  { name: "Dashboard", href: "/", icon: Zap },
  { name: "Log Workout", href: "/log-workout", icon: Plus },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Progress", href: "/progress", icon: TrendingUp },
];

export default function Navigation() {
  const [location] = useLocation();

  const NavItems = ({ mobile = false }) => (
    <>
      {navigation.map((item) => {
        const isActive = location === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              mobile ? "block" : "",
              isActive
                ? "text-primary border-b-2 border-primary pb-2"
                : "text-slate-600 hover:text-primary pb-2",
              mobile ? "text-base font-medium py-2" : ""
            )}
          >
            <div className={cn("flex items-center space-x-2", mobile ? "px-4" : "")}>
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </div>
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">FitTrack</h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <NavItems />
          </nav>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-secondary to-accent rounded-full"></div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-slate-200 px-4 py-2">
          <nav className="flex space-x-4 overflow-x-auto">
            <NavItems mobile />
          </nav>
        </div>
      </div>
    </header>
  );
}
