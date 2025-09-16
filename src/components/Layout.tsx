import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Users, UserPlus } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link to="/buyers" className="text-xl font-bold text-foreground">
                Buyer Leads Manager
              </Link>
              {user && (
                <nav className="flex space-x-4">
                  <Link to="/buyers">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>All Leads</span>
                    </Button>
                  </Link>
                  <Link to="/buyers/new">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <UserPlus className="h-4 w-4" />
                      <span>New Lead</span>
                    </Button>
                  </Link>
                </nav>
              )}
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}