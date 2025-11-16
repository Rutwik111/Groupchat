import React from 'react';
import AuthForm from '../components/AuthForm.tsx';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <AuthForm defaultMode="login" />
    </div>
  );
};

export default LoginPage;