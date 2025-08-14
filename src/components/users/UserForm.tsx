import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Shield, Eye, EyeOff, CheckCircle, AlertCircle, Users, Key } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Role, rolesService } from '../../services/firebaseService';

interface UserFormProps {
  onClose: () => void;
  onSubmit: (userData: UserFormData) => void;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
}

const UserForm: React.FC<UserFormProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: '',
  });
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
    color: string;
  }>({
    score: 0,
    feedback: [],
    color: 'gray'
  });
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (formData.password) {
      checkPasswordStrength(formData.password);
    } else {
      setPasswordStrength({ score: 0, feedback: [], color: 'gray' });
    }
  }, [formData.password]);

  const fetchRoles = async () => {
    try {
      setIsLoadingRoles(true);
      const fetchedRoles = await rolesService.getAll();
      setRoles(fetchedRoles);
      setRolesError(null);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRolesError('Failed to load roles');
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    const feedback: string[] = [];
    
    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }
    
    // Uppercase letter
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One uppercase letter');
    }
    
    // Lowercase letter
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One lowercase letter');
    }
    
    // Number
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('One number');
    }
    
    // Special character
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One special character');
    }

    let color = 'red';
    if (score >= 4) color = 'green';
    else if (score >= 3) color = 'yellow';
    else if (score >= 2) color = 'orange';

    setPasswordStrength({ score, feedback, color });
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Role validation
    if (!formData.role) {
      errors.role = 'Please select a role';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      setError(null);
      setSuccess('User created successfully!');
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'staff'
      });
    } catch (err: any) {
      console.error('Form submission error:', err);
      
      // Handle specific error types
      let errorMessage = err.message || 'Failed to create user';
      
      if (errorMessage.includes('email-already-in-use') || errorMessage.includes('already exists')) {
        errorMessage = `The email "${formData.email}" is already registered. Please use a different email address or check if this user already exists.`;
      } else if (errorMessage.includes('weak-password')) {
        errorMessage = 'Password is too weak. Please choose a stronger password (at least 6 characters).';
      } else if (errorMessage.includes('invalid-email')) {
        errorMessage = 'Please enter a valid email address.';
      }
      
      setError(errorMessage);
      setSuccess(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const quickFillDemo = () => {
    setFormData({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'SecurePass123!',
      phone: '+1 (555) 123-4567',
      role: roles.length > 0 ? roles[0].name : 'admin'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-500 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create New User</h2>
              <p className="text-sm text-gray-600">Add a new user to the system</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={quickFillDemo}
                  className="text-xs"
                  disabled={isLoading}
                >
                  Fill Demo Data
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={generateRandomPassword}
                  className="text-xs"
                  disabled={isLoading}
                >
                  Generate Password
                </Button>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <User className="h-5 w-5 text-primary-600" />
                <span>Personal Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Full Name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter full name"
                    disabled={isLoading}
                    error={validationErrors.name}
                  />
                </div>
                
                <div>
                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+1 (555) 123-4567"
                    disabled={isLoading}
                    error={validationErrors.phone}
                  />
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary-600" />
                <span>Account Information</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="user@example.com"
                    disabled={isLoading}
                    error={validationErrors.email}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter secure password"
                      disabled={isLoading}
                      className={`block w-full pl-10 pr-12 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
                        validationErrors.password
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                      } disabled:bg-gray-100 disabled:text-gray-500`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs text-gray-600">Password strength:</span>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1 w-4 rounded-full ${
                                level <= passwordStrength.score
                                  ? passwordStrength.color === 'green'
                                    ? 'bg-green-500'
                                    : passwordStrength.color === 'yellow'
                                    ? 'bg-yellow-500'
                                    : passwordStrength.color === 'orange'
                                    ? 'bg-orange-500'
                                    : 'bg-red-500'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            passwordStrength.color === 'green'
                              ? 'text-green-600'
                              : passwordStrength.color === 'yellow'
                              ? 'text-yellow-600'
                              : passwordStrength.color === 'orange'
                              ? 'text-orange-600'
                              : 'text-red-600'
                          }`}
                        >
                          {passwordStrength.score >= 4 ? 'Strong' : 
                           passwordStrength.score >= 3 ? 'Good' :
                           passwordStrength.score >= 2 ? 'Fair' : 'Weak'}
                        </span>
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <div className="text-xs text-gray-500">
                          Missing: {passwordStrength.feedback.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {validationErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Role Assignment */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary-600" />
                <span>Role Assignment</span>
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Role *
                </label>
                
                {rolesError && (
                  <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>{rolesError}</span>
                    </p>
                  </div>
                )}
                
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  disabled={isLoadingRoles || isLoading}
                  className={`block w-full rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
                    validationErrors.role
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                  } disabled:bg-gray-100 disabled:text-gray-500`}
                >
                  <option value="">
                    {isLoadingRoles ? 'Loading roles...' : 'Select a role'}
                  </option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                  {/* Fallback role if no custom roles exist */}
                  {!isLoadingRoles && roles.length === 0 && (
                    <option value="admin">Admin</option>
                  )}
                </select>
                
                {validationErrors.role && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.role}</p>
                )}
                
                {roles.length === 0 && !isLoadingRoles && !rolesError && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>No custom roles found. Using default admin role.</span>
                    </p>
                  </div>
                )}

                {/* Role Preview */}
                {formData.role && (
                  <div className="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-md">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary-600" />
                      <span className="text-sm font-medium text-primary-900">
                        Selected Role: {formData.role}
                      </span>
                    </div>
                    <p className="text-xs text-primary-700 mt-1">
                      This user will have all permissions assigned to the {formData.role} role.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            <span className="flex items-center space-x-1">
              <Shield className="h-4 w-4" />
              <span>User will receive login credentials via email</span>
            </span>
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!formData.name || !formData.email || !formData.password || !formData.phone || !formData.role}
            >
              {isLoading ? 'Creating User...' : 'Create User'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;