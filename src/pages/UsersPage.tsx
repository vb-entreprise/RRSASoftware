import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Users, Search, Mail, Phone, User, Shield, AlertTriangle, Eye, X } from 'lucide-react';
import Button from '../components/ui/Button';
import UserForm, { UserFormData } from '../components/users/UserForm';
import { User as UserType, usersService, rolesService } from '../services/firebaseService';
import { useAuth } from '../context/AuthContext';

const UsersPage: React.FC = () => {
  const { user: currentUser, hasModuleAccess, createUserAsAdmin } = useAuth();
  const [showUserForm, setShowUserForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchAvailableRoles();
  }, []);

  // Check if user has access to User Management - moved after hooks
  if (!hasModuleAccess('User Management')) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <Shield className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Access Restricted</h3>
          <p className="mt-2 text-sm text-gray-500">
            You don't have permission to access User Management.
          </p>
          <div className="mt-4 text-xs text-gray-400">
            Current role: <span className="font-medium capitalize">{currentUser?.role}</span>
          </div>
        </div>
      </div>
    );
  }

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const fetchedUsers = await usersService.getAll();
      console.log('Fetched users:', fetchedUsers);
      console.log('User roles:', fetchedUsers.map(u => ({ name: u.name, role: u.role })));
      setUsers(fetchedUsers);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableRoles = async () => {
    try {
      const roles = await rolesService.getAll();
      const roleNames = roles.map(role => role.name);
      
      // Ensure we always have the basic roles available
      const standardRoles = ['admin', 'doctor', 'staff', 'volunteer', 'photographer'];
      const allRoles = [...new Set([...standardRoles, ...roleNames])];
      
      setAvailableRoles(allRoles);
      console.log('Available roles:', allRoles);
    } catch (err) {
      console.error('Error fetching roles:', err);
      // Fallback to basic roles if fetch fails
      setAvailableRoles(['admin', 'doctor', 'staff', 'volunteer', 'photographer']);
    }
  };

  const handleAddUser = async (userData: UserFormData) => {
    try {
      // This will now show a modal for admin re-login and wait for completion
      await createUserAsAdmin(userData.name, userData.email, userData.password, userData.role as any, userData.phone || '');

      // Once admin is logged back in, refresh the users list and close the form
      await fetchUsers();
      setShowUserForm(false);
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  };

  const handleEditUser = async (userData: UserFormData) => {
    if (!editingUser?.id) return;
    
    try {
      // Update user data (excluding password if not provided)
      const updateData: any = {
        name: userData.name,
        phone: userData.phone,
        role: userData.role
      };
      
      // Only update password if a new one is provided
      if (userData.password) {
        updateData.password = userData.password;
      }
      
      await usersService.update(editingUser.id, updateData);
      await fetchUsers();
      setShowUserForm(false);
      setEditingUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await usersService.update(userId, { role: newRole });
      await fetchUsers();
      setError(null);
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersService.delete(userId);
        await fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all users in the system including their name, email, role and contact details.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button
              onClick={() => setShowUserForm(true)}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {currentUser?.role !== 'admin' && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-600">
              <strong>Note:</strong> Only administrators can modify user roles. Contact your administrator if you need to change a user's role.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Phone
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Role
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {user.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.phone}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                          {currentUser?.role === 'admin' ? (
                            <select
                              value={user.role}
                              onChange={(e) => user.id && handleUpdateUserRole(user.id, e.target.value)}
                              className="rounded border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                            >
                              {availableRoles.map(role => (
                                <option key={role} value={role} className="capitalize">
                                  {role.charAt(0).toUpperCase() + role.slice(1)}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                              {user.role}
                            </span>
                          )}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button 
                            className="text-primary-600 hover:text-primary-900 mr-3"
                            onClick={() => {
                              setEditingUser(user);
                              setShowUserForm(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => user.id && handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {showUserForm && (
          <UserForm
            onClose={() => {
              setShowUserForm(false);
              setEditingUser(null);
            }}
            onSubmit={editingUser ? handleEditUser : handleAddUser}
            user={editingUser ? {
              name: editingUser.name,
              email: editingUser.email,
              password: '', // Don't show current password
              phone: editingUser.phone || '',
              role: editingUser.role
            } : undefined}
            isEditMode={!!editingUser}
          />
        )}
      </div>
    </div>
  );
};

export default UsersPage;