import React from 'react';
import AuthForm from '../components/AuthForm.tsx';

const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <AuthForm defaultMode="signup" />
    </div>
  );
};

export default SignupPage;