import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Home, LogOut, User } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-700 bg-gray-900 backdrop-blur supports-[backdrop-filter]:bg-gray-900/80 shadow-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <MessageSquare size={28} className="text-purple-500" />
            <span className="hidden md:inline-block text-xl font-bold text-white">Copilot Chat AI</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Navigation Links for logged-in users */}
              <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
                <Link 
                  to="/" 
                  className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
                >
                  Home
                </Link>
                <Link 
                  to="/chat" 
                  className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
                >
                  Chats
                </Link>
              </nav>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 border border-gray-700">
                      <AvatarFallback className="bg-purple-600 text-white">
                        {user.email ? user.email[0].toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700 text-gray-200">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    className="cursor-pointer hover:bg-gray-700" 
                    onClick={() => navigate('/profile')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer hover:bg-gray-700" 
                    onClick={() => navigate('/chat')}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Chats</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-400 hover:bg-gray-700 hover:text-red-300" 
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button 
                variant="link" 
                className="text-gray-400 hover:text-white"
                onClick={() => navigate('/')}
              >
                Home
              </Button>
              <Button 
                onClick={() => navigate('/login')} 
                className="bg-purple-600 hover:bg-purple-700"
              >
                Sign In
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
