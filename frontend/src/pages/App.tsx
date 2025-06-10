import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "utils/use-theme";
import { Sun, Moon, Building, BarChart3, LineChart, TrendingUp, Users, Scroll, LogOut, LogIn } from "lucide-react";
import { OrganizationSelector } from "components/OrganizationSelector";
import { useCurrentOrganization } from "utils/organizationStore";
import { useCurrentUser, firebaseAuth } from "app"; // Import auth hooks
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

export default function App() {
  const { setTheme, theme } = useTheme();
  const currentOrganization = useCurrentOrganization();
  const { user, loading } = useCurrentUser(); // Get user status
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await firebaseAuth.signOut();
      // Optional: Add a toast message on successful sign out
    } catch (error) {
      console.error("Sign out failed:", error);
      // Optional: Add a toast message for sign out error
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Lucent Analytics</h1>
            <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
              Transform financial data into clear, actionable insights
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setTheme(theme === "dark" ? "light" : "dark");
              }}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
                        {loading ? (
              <Skeleton className="h-10 w-20" /> // Show skeleton while loading
            ) : user ? (
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            ) : (
              <Button asChild variant="default">
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" /> Sign In
                </Link>
              </Button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">Financial Performance Management Simplified</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Lucent Analytics is a cloud-native performance reporting and forecasting platform built for accountants, finance teams, and business advisors. Automatically import financial data, consolidate multiple entities, and generate clear insights in minutes.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-primary/10 mr-4">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Powerful Reporting</h3>
                  <p className="text-muted-foreground text-sm">Generate professional P&L, balance sheet, and cash flow reports in minutes.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-primary/10 mr-4">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Multi-Entity Consolidation</h3>
                  <p className="text-muted-foreground text-sm">Seamlessly consolidate multiple entities including multi-currency operations.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-primary/10 mr-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Advanced Forecasting</h3>
                  <p className="text-muted-foreground text-sm">Create rolling forecasts, scenario modeling, and budget vs. actual comparisons.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-primary/10 mr-4">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Collaborative Tools</h3>
                  <p className="text-muted-foreground text-sm">Work together in real-time, sharing dashboards and strategic action plans.</p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-4">
                            <Button 
                size="lg"
                onClick={() => navigate(user ? '/dashboard' : '/login')}
              >
                {user ? 'Go to Dashboard' : 'Get Started'}
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/organizations">
                  {currentOrganization ? "View Your Dashboard" : "Create an Organization"}
                </Link>
              </Button>
            </div>
          </div>
          <div className="bg-muted rounded-lg p-6 border">
            <div className="aspect-video bg-card rounded-md border shadow-sm flex items-center justify-center">
              <div className="text-center p-8">
                <LineChart className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Financial Dashboard Demo</h3>
                <p className="text-muted-foreground mb-4">
                  See how Lucent Analytics transforms your financial data into clear visualizations and actionable insights.
                </p>
                <Button asChild variant="secondary">
                  <Link to="/dashboard">View Demo Dashboard</Link>
                </Button>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-md border">
                <Scroll className="h-8 w-8 text-primary mb-2" />
                <h4 className="font-medium mb-1">Comprehensive Reports</h4>
                <p className="text-sm text-muted-foreground">Generate detailed financial reports with a few clicks.</p>
              </div>
              <div className="bg-card p-4 rounded-md border">
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <h4 className="font-medium mb-1">Strategic Forecasting</h4>
                <p className="text-sm text-muted-foreground">Make data-driven decisions with powerful forecasting tools.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to transform your financial reporting?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of accountants and financial advisors who are delivering deeper insights and growing their advisory services with Lucent Analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <Button 
              size="lg"
              onClick={() => navigate(user ? '/dashboard' : '/login')}
            >
              {user ? 'Go to Your Dashboard' : 'Start Your Free Trial'}
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/pricing">View Pricing Plans</Link>
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
            <div className="bg-card p-6 rounded-md border">
              <h3 className="font-bold text-lg mb-2">For Solo Practitioners</h3>
              <p className="text-muted-foreground mb-3">Perfect for individuals getting started with financial advisory.</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center"><div className="h-2 w-2 rounded-full bg-primary mr-2"></div>Single organization</li>
                <li className="flex items-center"><div className="h-2 w-2 rounded-full bg-primary mr-2"></div>Basic financial reports</li>
                <li className="flex items-center"><div className="h-2 w-2 rounded-full bg-primary mr-2"></div>Manual data imports</li>
              </ul>
              <p className="font-medium">Starting at <span className="text-xl">$0</span>/month</p>
            </div>
            
            <div className="bg-card p-6 rounded-md border relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">Popular</div>
              <h3 className="font-bold text-lg mb-2">For Small Firms</h3>
              <p className="text-muted-foreground mb-3">Designed for growing firms with multiple clients.</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center"><div className="h-2 w-2 rounded-full bg-primary mr-2"></div>Up to 10 organizations</li>
                <li className="flex items-center"><div className="h-2 w-2 rounded-full bg-primary mr-2"></div>Advanced financial reporting</li>
                <li className="flex items-center"><div className="h-2 w-2 rounded-full bg-primary mr-2"></div>Advanced forecasting</li>
              </ul>
              <p className="font-medium">Starting at <span className="text-xl">$79.99</span>/month</p>
            </div>
            
            <div className="bg-card p-6 rounded-md border">
              <h3 className="font-bold text-lg mb-2">For Enterprise</h3>
              <p className="text-muted-foreground mb-3">Complete solution for large advisory firms.</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center"><div className="h-2 w-2 rounded-full bg-primary mr-2"></div>Unlimited organizations</li>
                <li className="flex items-center"><div className="h-2 w-2 rounded-full bg-primary mr-2"></div>Custom white-labeling</li>
                <li className="flex items-center"><div className="h-2 w-2 rounded-full bg-primary mr-2"></div>Dedicated support</li>
              </ul>
              <p className="font-medium">Starting at <span className="text-xl">$199.99</span>/month</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t mt-24 py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="font-bold text-xl">Lucent Analytics</h3>
              <p className="text-muted-foreground text-sm">© 2025 BMP Advisory. All rights reserved.</p>
            </div>
            <div className="flex space-x-8">
              <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-foreground">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
