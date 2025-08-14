import React from 'react';
import AuthForm from '../components/AuthForm';
import Logo from '../components/Logo';

const AuthPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col py-12 sm:px-6 lg:px-8">
      <div className="flex-1 flex flex-col justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Animal Hospital Management
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Providing care for all animals in need
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <AuthForm />
        </div>
      </div>
      
      {/* Footer - Fixed at bottom */}
      <footer className="flex-shrink-0 py-6">
        <div className="text-center text-sm text-gray-600">
          Developed by <span className="font-semibold text-primary-600">VB Entreprise</span>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;