import React from 'react';
import ChangePassword from '../components/users/ChangePassword';

const ChangePasswordPage: React.FC = () => {
  return (
    <div className="px-4 py-4 sm:px-0">
      <div className="pb-5 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Change Password
        </h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Update your account password
        </p>
      </div>
      
      <div className="mt-6">
        <ChangePassword />
      </div>
    </div>
  );
};

export default ChangePasswordPage; 