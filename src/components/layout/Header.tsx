// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Brain, Search, User, Menu, LogOut } from "lucide-react";
// import { useState } from "react";
// import { useAuthContext } from "@/contexts/AuthContext";

// const Header = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const { user, logout } = useAuthContext();
  
//   const isActive = (path: string) => location.pathname === path;
  
//   const navLinks = [
//     { path: "/dashboard", label: "Dashboard" },
//     { path: "/learning-path", label: "Learning Path" },
//     { path: "/courses", label: "Courses" },
//     { path: "/search", label: "Search" },
//     { path: "/tutor", label: "AI Tutor" },
//   ];

//   const handleLogout = () => {
//     logout();
//     navigate("/");
//   };

//   return (
//     <header className="sticky top-0 z-50 glass border-b border-border/50">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo */}
//           <Link to="/" className="flex items-center gap-2 group">
//             <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow duration-300">
//               <Brain className="w-6 h-6 text-white" />
//             </div>
//             <span className="text-xl font-semibold text-foreground hidden sm:block">
//               Neuro<span className="text-primary">Learn</span>
//             </span>
//           </Link>

//           {/* Desktop Navigation */}
//           <nav className="hidden md:flex items-center gap-1">
//             {navLinks.map((link) => (
//               <Link
//                 key={link.path}
//                 to={link.path}
//                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
//                   isActive(link.path)
//                     ? "bg-primary/10 text-primary"
//                     : "text-muted-foreground hover:text-foreground hover:bg-secondary"
//                 }`}
//               >
//                 {link.label}
//               </Link>
//             ))}
//           </nav>

//           {/* Right Side Actions */}
//           <div className="flex items-center gap-2">
//             {user ? (
//               <>
//                 <Link to="/profile">
//                   <Button variant="ghost" size="icon" className="text-muted-foreground">
//                     <User className="w-5 h-5" />
//                   </Button>
//                 </Link>
//                 <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={handleLogout} title="Sign out">
//                   <LogOut className="w-5 h-5" />
//                 </Button>
//               </>
//             ) : (
//               <Link to="/auth">
//                 <Button variant="default" size="sm">Sign In</Button>
//               </Link>
//             )}
//             <Button 
//               variant="ghost" 
//               size="icon" 
//               className="md:hidden text-muted-foreground"
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//             >
//               <Menu className="w-5 h-5" />
//             </Button>
//           </div>
//         </div>

//         {/* Mobile Navigation */}
//         {mobileMenuOpen && (
//           <nav className="md:hidden py-4 border-t border-border/50 animate-slide-up">
//             {navLinks.map((link) => (
//               <Link
//                 key={link.path}
//                 to={link.path}
//                 onClick={() => setMobileMenuOpen(false)}
//                 className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
//                   isActive(link.path)
//                     ? "bg-primary/10 text-primary"
//                     : "text-muted-foreground hover:text-foreground hover:bg-secondary"
//                 }`}
//               >
//                 {link.label}
//               </Link>
//             ))}
//           </nav>
//         )}
//       </div>
//     </header>
//   );
// };

// export default Header;





import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, User, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAuthStore } from "@/store/authStore";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuthContext();
  const { user } = useAuthStore();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/learning-path", label: "Learning Path" },
    { path: "/assessment", label: "Assessments" },
    { path: "/courses", label: "Courses" },
    { path: "/tutor", label: "AI Tutor" },
  ];


  if (user?.role === 'instructor' || user?.role === 'admin') {
    navLinks.push({ path: "/instructor/curriculum-builder", label: "Curriculum Builder" });
  }

  if (user?.role === 'admin') {
    navLinks.push({ path: "/admin/users", label: "User Management" });
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo - Cleaner, typographic focus */}
          <Link to="/" className="flex items-center gap-2 group">
            <Brain className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold tracking-tight text-foreground hidden sm:block">
              NeuroLearn
            </span>
          </Link>

          {/* Desktop Navigation - Clean, subtle hover states */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={handleLogout} title="Sign out">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mr-2">
                  Log in
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="rounded-full px-4">Get Started</Button>
                </Link>
              </>
            )}
            
            {/* Mobile Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-muted-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;