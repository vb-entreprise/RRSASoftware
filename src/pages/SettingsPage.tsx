import React, { useState } from 'react';
import { 
  Settings, 
  Book, 
  Info, 
  User, 
  Mail, 
  Shield, 
  Phone, 
  MapPin, 
  Calendar, 
  Check, 
  AlertTriangle, 
  Star,
  ChevronRight,
  RefreshCw,
  UserPlus,
  HelpCircle,
  Heart,
  Activity,
  Database,
  Users,
  FileText,
  Camera,
  Package,
  ClipboardList,
  Home,
  MessageCircle,
  QrCode,
  ExternalLink,
  Copy,
  Clock,
  Key,
  Save,
  Eye,
  EyeOff,
  Globe
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { initializeDefaultRoles, rolesService } from '../services/firebaseService';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isPromoting, setIsPromoting] = useState(false);
  const [promotionError, setPromotionError] = useState<string | null>(null);
  const [isFixingPermissions, setIsFixingPermissions] = useState(false);
  
  // System Time Settings
  const [systemTimeZone, setSystemTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [isUpdatingTime, setIsUpdatingTime] = useState(false);
  const [timeMessage, setTimeMessage] = useState<string | null>(null);
  
  // Password Change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handlePromoteToAdmin = async () => {
    if (!user) return;
    
    setIsPromoting(true);
    setPromotionError(null);
    
    try {
      // Initialize default roles first
      await initializeDefaultRoles();
      
      // Update user role to admin
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, {
        role: 'admin',
        updatedAt: new Date()
      }, { merge: true });

      // Force reload the page to refresh permissions
      window.location.reload();
    } catch (error) {
      console.error('Error promoting to admin:', error);
      setPromotionError('Failed to promote to admin. Please try again.');
    } finally {
      setIsPromoting(false);
    }
  };

  const handleTimeZoneUpdate = async () => {
    setIsUpdatingTime(true);
    setTimeMessage(null);
    
    try {
      // Update user's timezone preference in Firestore
      if (user) {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, {
          timeZone: systemTimeZone,
          updatedAt: new Date()
        });
        setTimeMessage('System time zone updated successfully!');
      }
    } catch (error) {
      console.error('Error updating timezone:', error);
      setTimeMessage('Failed to update time zone. Please try again.');
    } finally {
      setIsUpdatingTime(false);
      // Clear message after 3 seconds
      setTimeout(() => setTimeMessage(null), 3000);
    }
  };

  const handlePasswordChange = async () => {
    if (!user || !auth.currentUser) return;
    
    setIsChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    
    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      setIsChangingPassword(false);
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      setIsChangingPassword(false);
      return;
    }
    
    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, passwordForm.currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await updatePassword(auth.currentUser, passwordForm.newPassword);
      
      // Clear form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setPasswordSuccess('Password changed successfully!');
      
      // Clear success message after 5 seconds
      setTimeout(() => setPasswordSuccess(null), 5000);
      
    } catch (error: any) {
      console.error('Password change error:', error);
      
      let errorMessage = 'Failed to change password';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please log out and log in again before changing password';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setPasswordError(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleFixPermissions = async () => {
    if (!user) return;
    
    setIsFixingPermissions(true);
    setPromotionError(null);
    
    try {
      console.log('Step 1: Creating admin permissions manually...');
      
      // Create admin permissions directly
      const adminPermissions = [
        {
          module: 'Dashboard',
          actions: [
            { name: 'View Dashboard', enabled: true },
            { name: 'View Analytics', enabled: true },
            { name: 'View Reports', enabled: true }
          ]
        },
        {
          module: 'Case Management',
          actions: [
            { name: 'View Cases', enabled: true },
            { name: 'Create Cases', enabled: true },
            { name: 'Edit Cases', enabled: true },
            { name: 'Delete Cases', enabled: true },
            { name: 'Archive Cases', enabled: true }
          ]
        },
        {
          module: 'User Management',
          actions: [
            { name: 'View Users', enabled: true },
            { name: 'Create Users', enabled: true },
            { name: 'Edit Users', enabled: true },
            { name: 'Delete Users', enabled: true }
          ]
        },
        {
          module: 'Role Management',
          actions: [
            { name: 'View Roles', enabled: true },
            { name: 'Create Roles', enabled: true },
            { name: 'Edit Roles', enabled: true },
            { name: 'Delete Roles', enabled: true }
          ]
        },
        {
          module: 'Animal Care',
          actions: [
            { name: 'View Care Records', enabled: true },
            { name: 'Add Care Records', enabled: true },
            { name: 'Edit Care Records', enabled: true },
            { name: 'Delete Care Records', enabled: true }
          ]
        },
        {
          module: 'Facility Management',
          actions: [
            { name: 'View Cleaning Records', enabled: true },
            { name: 'Add Cleaning Records', enabled: true },
            { name: 'Edit Cleaning Records', enabled: true },
            { name: 'Delete Cleaning Records', enabled: true }
          ]
        },
        {
          module: 'Inventory',
          actions: [
            { name: 'View Inventory', enabled: true },
            { name: 'Add Items', enabled: true },
            { name: 'Edit Items', enabled: true },
            { name: 'Delete Items', enabled: true },
            { name: 'Generate Reports', enabled: true }
          ]
        },
        {
          module: 'Media Library',
          actions: [
            { name: 'View Media', enabled: true },
            { name: 'Upload Media', enabled: true },
            { name: 'Edit Media', enabled: true },
            { name: 'Delete Media', enabled: true }
          ]
        }
      ];
      
      console.log('Step 2: Initializing default roles...');
      await initializeDefaultRoles();
      
      console.log('Step 3: Updating user document with admin permissions...');
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, {
        name: user.name,
        email: user.email,
        role: 'admin',
        permissions: adminPermissions,
        phone: user.phone || '',
        updatedAt: new Date()
      }, { merge: true });
      
      console.log('Step 4: Verification - checking updated document...');
      const updatedDoc = await getDoc(userRef);
      const updatedData = updatedDoc.data();
      console.log('Updated user data:', updatedData);
      console.log('Permissions count:', updatedData?.permissions?.length);
      
      alert(`Admin permissions fixed! You now have ${adminPermissions.length} module permissions. The page will reload.`);
      
      // Force reload the page to refresh permissions
      window.location.reload();
    } catch (error: any) {
      console.error('Error fixing permissions:', error);
      setPromotionError(`Failed to fix permissions: ${error.message}`);
    } finally {
      setIsFixingPermissions(false);
    }
  };

  const tabs = [
    { 
      id: 'general', 
      name: 'Account', 
      icon: User,
      description: 'Profile and account settings'
    },
    { 
      id: 'guide', 
      name: 'User Guide', 
      icon: Book,
      description: 'How to use the system'
    },
    { 
      id: 'contact', 
      name: 'Contact & Support', 
      icon: MessageCircle,
      description: 'Get help and support'
    },
    { 
      id: 'about', 
      name: 'About', 
      icon: Info,
      description: 'System information'
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'doctor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'staff':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'volunteer':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'photographer':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderGeneralSettings = () => {
    return (
      <div className="space-y-8">
        {/* Profile Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 rounded-full p-3">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">{user?.name}</h3>
                <p className="text-sm text-gray-600">Animal Hospital Management System</p>
                                 <div className="mt-2">
                   <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user?.role || '')}`}>
                     <Shield className="h-3 w-3 mr-1" />
                     {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                   </span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-gray-500" />
              Account Information
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-sm text-gray-900 font-medium">{user?.name || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <p className="text-sm text-gray-900 font-medium">{user?.email || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <p className="text-sm text-gray-900 font-medium">{user?.phone || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Member Since</label>
                    <p className="text-sm text-gray-900 font-medium">June 2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Star className="h-5 w-5 mr-2 text-gray-500" />
              Quick Actions
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user?.role !== 'admin' && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Upgrade to Administrator</h4>
                      <p className="text-sm text-gray-600 mt-1">Get full access to all system features</p>
                    </div>
                    <UserPlus className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="mt-4">
                    <Button
                      onClick={handlePromoteToAdmin}
                      isLoading={isPromoting}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isPromoting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Promoting...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Promote to Admin
                        </>
                      )}
                    </Button>
                    {promotionError && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          {promotionError}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {user?.role === 'admin' && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Fix Admin Permissions</h4>
                      <p className="text-sm text-gray-600 mt-1">Restore missing menu items and permissions</p>
                    </div>
                    <Shield className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="mt-4">
                    <Button
                      onClick={handleFixPermissions}
                      isLoading={isFixingPermissions}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isFixingPermissions ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Fixing Permissions...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Fix Permissions
                        </>
                      )}
                    </Button>
                    <p className="mt-2 text-xs text-gray-500">
                      Use this if menu items are not visible even though you're an admin
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Time Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-500" />
              System Time Settings
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Globe className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Current Time</label>
                    <p className="text-sm text-gray-900 font-medium">
                      {new Date().toLocaleString('en-US', { 
                        timeZone: systemTimeZone,
                        dateStyle: 'medium',
                        timeStyle: 'long'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                    <select
                      value={systemTimeZone}
                      onChange={(e) => setSystemTimeZone(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="Asia/Kolkata">India Standard Time (IST)</option>
                      <option value="UTC">Coordinated Universal Time (UTC)</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                      <option value="Europe/Paris">Central European Time (CET)</option>
                      <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                      <option value="Australia/Sydney">Australian Eastern Time (AET)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col justify-center space-y-4">
                <Button
                  onClick={handleTimeZoneUpdate}
                  isLoading={isUpdatingTime}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isUpdatingTime ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Time Zone
                    </>
                  )}
                </Button>
                
                {timeMessage && (
                  <div className={`p-3 rounded-md ${
                    timeMessage.includes('successfully') 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`text-sm flex items-center ${
                      timeMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {timeMessage.includes('successfully') ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 mr-2" />
                      )}
                      {timeMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Key className="h-5 w-5 mr-2 text-gray-500" />
              Change Password
            </h3>
          </div>
          <div className="p-6">
            <div className="max-w-md">
              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({
                        ...prev,
                        current: !prev.current
                      }))}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({
                        ...prev,
                        new: !prev.new
                      }))}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({
                        ...prev,
                        confirm: !prev.confirm
                      }))}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error/Success Messages */}
                {passwordError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {passwordError}
                    </p>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-600 text-sm flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      {passwordSuccess}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  onClick={handlePasswordChange}
                  isLoading={isChangingPassword}
                  disabled={
                    !passwordForm.currentPassword || 
                    !passwordForm.newPassword || 
                    !passwordForm.confirmPassword ||
                    isChangingPassword
                  }
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isChangingPassword ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>

                <div className="text-xs text-gray-500">
                  <p>Password requirements:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>At least 6 characters long</li>
                    <li>Must enter current password for security</li>
                    <li>New password must be different from current</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Statistics */}
        {user?.role === 'admin' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-gray-500" />
                System Overview
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Database className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Database</p>
                  <p className="text-xs text-gray-600">Connected</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Users</p>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <FileText className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Records</p>
                  <p className="text-xs text-gray-600">Managed</p>
                </div>
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <Heart className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Animals</p>
                  <p className="text-xs text-gray-600">Cared For</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderHowToGuide = () => {
    const guideSteps = [
      {
        title: 'Getting Started',
        icon: Home,
        color: 'blue',
        steps: [
          'Make sure you have the correct role and permissions',
          'Navigate through different sections using the sidebar menu',
          'Use the "+" button to add new records in each section',
          'Check the dashboard for overview and quick stats'
        ]
      },
      {
        title: 'Managing Records',
        icon: FileText,
        color: 'green',
        steps: [
          'Click on any record to view its details',
          'Use the edit button to modify existing records',
          'Delete records using the delete button (requires admin permission)',
          'Use search and filters to find specific records'
        ]
      },
      {
        title: 'User Management',
        icon: Users,
        color: 'purple',
        steps: [
          'Add new users with appropriate roles',
          'Manage user permissions through roles',
          'Monitor user activity and access',
          'Promote users to admin when needed'
        ]
      },
      {
        title: 'Reports & Analytics',
        icon: Activity,
        color: 'orange',
        steps: [
          'View analytics on the dashboard',
          'Generate reports from specific sections',
          'Export data when needed',
          'Monitor system performance'
        ]
      }
    ];

    return (
      <div className="space-y-6">
        {guideSteps.map((section, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className={`px-6 py-4 bg-${section.color}-50 border-b border-${section.color}-200`}>
              <h3 className={`text-lg font-semibold text-${section.color}-900 flex items-center`}>
                <section.icon className={`h-6 w-6 mr-3 text-${section.color}-600`} />
                {section.title}
              </h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {section.steps.map((step, stepIndex) => (
                  <li key={stepIndex} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-6 h-6 bg-${section.color}-100 text-${section.color}-600 rounded-full flex items-center justify-center text-sm font-medium`}>
                      {stepIndex + 1}
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-yellow-500 rounded-full p-2">
              <HelpCircle className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Quick Tips</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <p className="text-sm text-gray-700">Always backup important data regularly</p>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <p className="text-sm text-gray-700">Use filters to quickly find specific records</p>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <p className="text-sm text-gray-700">Keep your profile information up to date</p>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <p className="text-sm text-gray-700">Contact admin for permission issues</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContactSupport = () => {
    // WhatsApp link
    const whatsappNumber = "919909206443"; // Including country code
    const whatsappMessage = "Hello! I need help with the RRSA Animal Hospital Management System.";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    
    // QR Code URLs using a free QR code API
    const whatsappQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(whatsappUrl)}`;
    const emailQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('mailto:info@vbenterprise.com')}`;

    const copyToClipboard = (text: string, type: string) => {
      navigator.clipboard.writeText(text).then(() => {
        alert(`${type} copied to clipboard!`);
      }).catch(() => {
        alert('Failed to copy to clipboard');
      });
    };

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl text-white p-8">
          <div className="flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <MessageCircle className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Contact & Support</h2>
              <p className="text-green-100 mt-2">Get in touch with our support team for assistance</p>
            </div>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* WhatsApp Contact */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-green-50 border-b border-green-200">
              <h3 className="text-lg font-semibold text-green-900 flex items-center">
                <MessageCircle className="h-6 w-6 mr-3 text-green-600" />
                WhatsApp Support
              </h3>
              <p className="text-sm text-green-700 mt-1">Quick support via WhatsApp</p>
            </div>
            <div className="p-6">
              <div className="text-center">
                {/* QR Code */}
                <div className="mb-6">
                  <div className="inline-block p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <img 
                      src={whatsappQrUrl} 
                      alt="WhatsApp QR Code"
                      className="w-48 h-48 mx-auto"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Scan to open WhatsApp</p>
                </div>

                {/* Contact Details */}
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-2">
                      <Phone className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">+91 99092 06443</span>
                      <button
                        onClick={() => copyToClipboard('+91 99092 06443', 'Phone number')}
                        className="p-1 hover:bg-green-200 rounded"
                        title="Copy phone number"
                      >
                        <Copy className="h-4 w-4 text-green-600" />
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={() => window.open(whatsappUrl, '_blank')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Open WhatsApp
                    </Button>
                    <Button
                      onClick={() => copyToClipboard(whatsappUrl, 'WhatsApp link')}
                      variant="secondary"
                      className="px-3"
                      title="Copy WhatsApp link"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Contact */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 flex items-center">
                <Mail className="h-6 w-6 mr-3 text-blue-600" />
                Email Support
              </h3>
              <p className="text-sm text-blue-700 mt-1">Professional email support</p>
            </div>
            <div className="p-6">
              <div className="text-center">
                {/* QR Code */}
                <div className="mb-6">
                  <div className="inline-block p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <img 
                      src={emailQrUrl} 
                      alt="Email QR Code"
                      className="w-48 h-48 mx-auto"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Scan to open email</p>
                </div>

                {/* Contact Details */}
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-2">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">info@vbenterprise.com</span>
                      <button
                        onClick={() => copyToClipboard('info@vbenterprise.com', 'Email address')}
                        className="p-1 hover:bg-blue-200 rounded"
                        title="Copy email address"
                      >
                        <Copy className="h-4 w-4 text-blue-600" />
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={() => window.open('mailto:info@vbenterprise.com?subject=RRSA System Support Request', '_blank')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                    <Button
                      onClick={() => copyToClipboard('info@vbenterprise.com', 'Email address')}
                      variant="secondary"
                      className="px-3"
                      title="Copy email address"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-gray-500" />
              Support Information
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <MessageCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">WhatsApp</h4>
                <p className="text-sm text-gray-600">Instant support</p>
                <p className="text-xs text-green-600 mt-1">24/7 Available</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Mail className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Email</h4>
                <p className="text-sm text-gray-600">Detailed support</p>
                <p className="text-xs text-blue-600 mt-1">Within 24 hours</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Book className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">User Guide</h4>
                <p className="text-sm text-gray-600">Self-help docs</p>
                <p className="text-xs text-purple-600 mt-1">Always available</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Settings className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">System Status</h4>
                <p className="text-sm text-gray-600">Live monitoring</p>
                <p className="text-xs text-green-600 mt-1">
                  <Check className="h-3 w-3 inline mr-1" />
                  All systems operational
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Immediate Help?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => window.open(whatsappUrl, '_blank')}
                className="bg-green-600 hover:bg-green-700 flex items-center"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat on WhatsApp
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
              <Button
                onClick={() => window.open('mailto:info@vbenterprise.com?subject=Urgent: RRSA System Support Required', '_blank')}
                variant="secondary"
                className="flex items-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Urgent Email
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Our support team is here to help you with any issues or questions about the RRSA Animal Hospital Management System.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderAboutSystem = () => {
    const features = [
      { name: 'Case Paper Management', icon: FileText, description: 'Complete patient record management' },
      { name: 'Animal Care Records', icon: Heart, description: 'Track medical treatments and care' },
      { name: 'Inventory Management', icon: Package, description: 'Manage supplies and medications' },
      { name: 'Staff Management', icon: Users, description: 'User roles and permissions' },
      { name: 'Cleaning Records', icon: ClipboardList, description: 'Facility maintenance tracking' },
      { name: 'Media Management', icon: Camera, description: 'Photo and document storage' }
    ];

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-8">
          <div className="flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <Heart className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">RRSA Animal Hospital Management System</h2>
              <p className="text-blue-100 mt-2">Comprehensive solution for animal hospitals and rescue centers</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">System Features</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <feature.icon className="h-8 w-8 text-blue-500" />
                    <div>
                      <h4 className="font-medium text-gray-900">{feature.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Version Information</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">v1.0.0</div>
                <p className="text-sm text-gray-600">Current Version</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">2025</div>
                <p className="text-sm text-gray-600">Release Year</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">VB</div>
                <p className="text-sm text-gray-600">Enterprise</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              Our system is designed to streamline animal hospital operations and improve patient care.
            </p>
            <div className="flex justify-center space-x-4">
              <div className="text-sm text-gray-500">
                <strong>Developed by:</strong> VB Enterprise
              </div>
              <div className="text-sm text-gray-500">
                <strong>Last Updated:</strong> June 2025
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 rounded-lg p-2">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-600">Manage your account and system preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className={`mr-2 h-5 w-5 ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  <div className="text-left">
                    <div>{tab.name}</div>
                    <div className="text-xs text-gray-500">{tab.description}</div>
                  </div>
                  <ChevronRight className={`ml-2 h-4 w-4 ${
                    activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'guide' && renderHowToGuide()}
          {activeTab === 'contact' && renderContactSupport()}
          {activeTab === 'about' && renderAboutSystem()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 