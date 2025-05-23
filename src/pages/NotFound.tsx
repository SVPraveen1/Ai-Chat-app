import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center p-8 bg-gray-800 rounded-lg border border-gray-700 shadow-xl max-w-md">
        <h1 className="text-6xl font-bold mb-4 text-purple-500">404</h1>
        <p className="text-xl text-gray-300 mb-6">Oops! Page not found</p>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <a 
          href="/" 
          className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
