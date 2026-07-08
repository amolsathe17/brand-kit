import React from 'react';
import { useStore } from './store/useStore';
import AuthPage from './views/AuthPage';
import UserDashboard from './views/UserDashboard';
import AdminDashboard from './views/AdminDashboard';

function App() {
  const { user } = useStore();

  // If no user is logged in, show the Auth / Login screen
  if (!user) {
    return <AuthPage />;
  }

  // Routing based on user roles
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}

export default App;
