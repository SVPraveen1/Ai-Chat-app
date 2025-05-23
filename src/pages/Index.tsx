
import { Navigate } from 'react-router-dom';

// This file is kept for compatibility but has been replaced by the new routing system
// The content has been moved to App.tsx and LandingPage.tsx

const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
