import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Shield, Users, Lock, AlertTriangle, Eye, X, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import RoleForm, { RoleFormData } from '../components/roles/RoleForm';
import { Role, rolesService, initializeDefaultRoles } from '../services/firebaseService';
import { useAuth } from '../context/AuthContext';

const RolesPage: React.FC = () => {
  const { user, hasModuleAccess } = useAuth();
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRoleDetails, setShowRoleDetails] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Security check - only users with Role Management access can manage roles
  const canManageRoles = hasModuleAccess('Role Management');
  const isSystemRole = (roleName: string) => {
    const systemRoles = ['admin'];
    const isSystem = systemRoles.includes(roleName.toLowerCase());
    console.log(`Checking if "${roleName}" is system role:`, isSystem);
    return isSystem;
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const fetchedRoles = await rolesService.getAll();
      
      // Filter out corrupted roles and validate data structure
      const validRoles = fetchedRoles.filter(role => {
        if (!role || !role.name) {
          console.warn('Invalid role found:', role);
          return false;
        }
        return true;
      });
      
      setRoles(validRoles);
      setError(null);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to fetch roles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitializeRoles = async () => {
    try {
      setIsInitializing(true);
      setError(null);
      await initializeDefaultRoles();
      await fetchRoles(); // Refresh the roles list
    } catch (err) {
      console.error('Error initializing roles:', err);
      setError('Failed to initialize default roles');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAddRole = async (roleData: RoleFormData) => {
    try {
      if (selectedRole) {
        // Editing existing role
        await rolesService.update(selectedRole.id!, roleData);
      } else {
        // Creating new role
        await rolesService.create(roleData);
      }
      setShowRoleForm(false);
      setSelectedRole(null);
      fetchRoles(); // Refresh the list
    } catch (error) {
      console.error('Error saving role:', error);
      setError('Failed to save role');
    }
  };

  const handleDeleteRole = async () => {
    console.log('Delete role attempt:', selectedRole);
    console.log('Can manage roles:', canManageRoles);
    console.log('User role:', user?.role);
    
    if (!selectedRole) {
      setError('No role selected for deletion');
      return;
    }
    
    if (!selectedRole.id) {
      setError('Role ID is missing - cannot delete role without ID');
      return;
    }
    
    if (!canManageRoles) {
      setError('You do not have permission to delete roles. Only users with Role Management access can manage roles.');
      setShowDeleteDialog(false);
      return;
    }
    
    // Prevent deletion of system roles
    if (isSystemRole(selectedRole.name)) {
      setError('System roles (Admin) cannot be deleted for security reasons.');
      setShowDeleteDialog(false);
      return;
    }

    try {
      setIsDeleting(true);
      console.log('Attempting to delete role with ID:', selectedRole.id);
      await rolesService.delete(selectedRole.id);
      console.log('Role deleted successfully');
      fetchRoles(); // Refresh the list
      setShowDeleteDialog(false);
      setSelectedRole(null);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error deleting role:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to delete role: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (role: Role) => {
    console.log('Opening delete dialog for role:', role);
    console.log('Role ID exists:', !!role.id);
    console.log('Is system role:', isSystemRole(role.name));
    setSelectedRole(role);
    setShowDeleteDialog(true);
    setError(null);
  };

  const openRoleDetails = (role: Role) => {
    setSelectedRole(role);
    setShowRoleDetails(true);
  };

  const getEnabledPermissionsCount = (role: Role) => {
    // Add defensive checks to prevent crashes
    if (!role.permissions || !Array.isArray(role.permissions)) {
      return 0;
    }
    
    return role.permissions.reduce((total, module) => {
      // Check if module and actions exist
      if (!module || !module.actions || !Array.isArray(module.actions)) {
        return total;
      }
      
      return total + module.actions.filter(action => action && action.enabled).length;
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Access control check
  if (!canManageRoles) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <Lock className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Access Restricted</h3>
          <p className="mt-2 text-sm text-gray-500">
            Only users with Role Management access can manage roles and permissions.
          </p>
          <div className="mt-4 text-xs text-gray-400">
            Current role: <span className="font-medium capitalize">{user?.role}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header with security indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center">
        <div className="flex-auto">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Role Management</h1>
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-700">
                Secure access control and permission management
              </p>
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 sm:mr-2"></div>
              Role Management Access Active
            </div>
            <div className="flex items-center text-gray-500">
              <Users className="h-3 w-3 mr-1" />
              {roles.length} Roles Configured
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button 
            onClick={() => {
              setSelectedRole(null);
              setShowRoleForm(true);
            }} 
            className="w-full sm:w-auto flex items-center justify-center bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Role
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      {/* Roles grid */}
      <div className="mt-6 sm:mt-8">
        {roles.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <Shield className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Roles Found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by creating default roles or adding your first custom role.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleInitializeRoles}
                variant="primary"
                className="flex items-center justify-center"
                isLoading={isInitializing}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {isInitializing ? 'Creating Default Roles...' : 'Create Default Roles'}
              </Button>
              <Button
                onClick={() => {
                  setSelectedRole(null);
                  setShowRoleForm(true);
                }}
                variant="secondary"
                className="flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Role
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {roles.map(role => (
              <div
                key={role.id}
                className={`relative bg-white rounded-lg border ${
                  isSystemRole(role.name) ? 'border-primary-200' : 'border-gray-200'
                } shadow-sm hover:shadow-md transition-shadow duration-200`}
              >
                {/* System role badge */}
                {isSystemRole(role.name) && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                      System Role
                    </span>
                  </div>
                )}

                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Lock className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        isSystemRole(role.name) ? 'text-primary-500' : 'text-gray-400'
                      }`} />
                      <h3 className="text-sm sm:text-base font-medium text-gray-900 capitalize">
                        {role.name}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-2 text-xs sm:text-sm text-gray-500">
                    {role.name} Role
                  </div>

                  <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
                    <Shield className="h-3 w-3" />
                    <span>{getEnabledPermissionsCount(role)} permissions enabled</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      onClick={() => openRoleDetails(role)}
                      variant="secondary"
                      size="sm"
                      className="flex items-center text-xs sm:text-sm"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      View
                    </Button>
                    {!isSystemRole(role.name) && (
                      <>
                        <Button
                          onClick={() => {
                            setSelectedRole(role);
                            setShowRoleForm(true);
                          }}
                          variant="secondary"
                          size="sm"
                          className="flex items-center text-xs sm:text-sm"
                        >
                          <Pencil className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => openDeleteDialog(role)}
                          variant="secondary"
                          size="sm"
                          className="flex items-center text-xs sm:text-sm text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role form modal */}
      {showRoleForm && (
        <RoleForm
          onSubmit={handleAddRole}
          onClose={() => {
            setShowRoleForm(false);
            setSelectedRole(null);
          }}
          existingRole={selectedRole || undefined}
        />
      )}

      {/* Delete confirmation dialog */}
      {showDeleteDialog && selectedRole && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowDeleteDialog(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Role
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the role "{selectedRole.name}"? This action cannot be undone.
                  </p>
                </div>
                  </div>
                </div>
            </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={handleDeleteRole}
                  variant="secondary"
                  className="w-full sm:w-auto sm:ml-3 justify-center text-red-600 hover:text-red-700"
                  isLoading={isDeleting}
                >
                  Delete
                </Button>
              <Button
                  onClick={() => setShowDeleteDialog(false)}
                variant="secondary"
                  className="mt-3 sm:mt-0 w-full sm:w-auto justify-center"
              >
                Cancel
              </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role details modal */}
      {showRoleDetails && selectedRole && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowRoleDetails(false)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Shield className="h-6 w-6 text-primary-600" />
                    </div>
                <div>
                      <h3 className="text-lg font-medium text-gray-900 capitalize">
                        {selectedRole.name} Role Details
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Role permissions and access control settings
                  </p>
                </div>
              </div>
              <button
                    onClick={() => setShowRoleDetails(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                    <span className="sr-only">Close</span>
                    <X className="h-5 w-5" />
              </button>
            </div>

                <div className="mt-6 space-y-6">
                  {selectedRole.permissions?.map((module, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 capitalize mb-3">
                        {module.module}
                      </h4>
                      <div className="space-y-2">
                      {module.actions?.map((action, actionIndex) => (
                        <div
                          key={actionIndex}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-700 capitalize">{action.name}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              action.enabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {action.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default RolesPage;