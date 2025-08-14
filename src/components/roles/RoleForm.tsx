import React, { useState } from 'react';
import { X, Shield, Users, Plus, Minus } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Permission, Role } from '../../services/firebaseService';

interface RoleFormProps {
  onClose: () => void;
  onSubmit: (roleData: RoleFormData) => void;
  existingRole?: Role;
}

export interface RoleFormData {
  name: string;
  permissions: Permission[];
}

// Simplified permissions configuration
const MODULES = [
  {
    name: 'Dashboard',
    actions: ['View Dashboard', 'View Analytics', 'View Reports']
  },
  {
    name: 'Case Management',
    actions: ['View Cases', 'Create Cases', 'Edit Cases', 'Delete Cases', 'Archive Cases']
  },
  {
    name: 'User Management',
    actions: ['View Users', 'Create Users', 'Edit Users', 'Delete Users']
  },
  {
    name: 'Role Management',
    actions: ['View Roles', 'Create Roles', 'Edit Roles', 'Delete Roles']
  },
  {
    name: 'Animal Care',
    actions: ['View Care Records', 'Add Care Records', 'Edit Care Records', 'Delete Care Records']
  },
  {
    name: 'Facility Management',
    actions: ['View Cleaning Records', 'Add Cleaning Records', 'Edit Cleaning Records', 'Delete Cleaning Records']
  },
  {
    name: 'Inventory',
    actions: ['View Inventory', 'Add Items', 'Edit Items', 'Delete Items', 'Generate Reports']
  },
  {
    name: 'Media Library',
    actions: ['View Media', 'Upload Media', 'Edit Media', 'Delete Media']
  }
];

const RoleForm: React.FC<RoleFormProps> = ({ onClose, onSubmit, existingRole }) => {
  const [roleName, setRoleName] = useState(existingRole?.name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize permissions state - if editing, pre-fill with existing permissions
  const [selectedPermissions, setSelectedPermissions] = useState<{[moduleName: string]: {[actionName: string]: boolean}}>(
    MODULES.reduce((acc, module) => {
      acc[module.name] = module.actions.reduce((actionAcc, action) => {
        // If editing an existing role, check if this permission is enabled
        if (existingRole?.permissions) {
          const existingModule = existingRole.permissions.find(p => p.module === module.name);
          const existingAction = existingModule?.actions.find(a => a.name === action);
          actionAcc[action] = existingAction?.enabled || false;
        } else {
          actionAcc[action] = false;
        }
        return actionAcc;
      }, {} as {[actionName: string]: boolean});
      return acc;
    }, {} as {[moduleName: string]: {[actionName: string]: boolean}})
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roleName.trim()) {
      setError('Role name is required');
      return;
    }

    // Convert selectedPermissions to the required format
    const permissions: Permission[] = MODULES.map(module => ({
      module: module.name,
      actions: module.actions.map(action => ({
        name: action,
        enabled: selectedPermissions[module.name][action] || false
      }))
    }));

    // Check if at least one permission is selected
    const hasPermissions = permissions.some(module => 
      module.actions.some(action => action.enabled)
    );

    if (!hasPermissions) {
      setError('Please select at least one permission');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await onSubmit({
        name: roleName.trim(),
        permissions
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermission = (moduleName: string, actionName: string) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        [actionName]: !prev[moduleName][actionName]
      }
    }));
  };

  const toggleAllForModule = (moduleName: string) => {
    const modulePermissions = selectedPermissions[moduleName];
    const allSelected = Object.values(modulePermissions).every(Boolean);
    
    setSelectedPermissions(prev => ({
      ...prev,
      [moduleName]: Object.keys(modulePermissions).reduce((acc, action) => {
        acc[action] = !allSelected;
        return acc;
      }, {} as {[actionName: string]: boolean})
    }));
  };

  const getSelectedCount = (moduleName: string) => {
    return Object.values(selectedPermissions[moduleName]).filter(Boolean).length;
  };

  const getTotalSelectedCount = () => {
    return Object.values(selectedPermissions).reduce((total, modulePerms) => {
      return total + Object.values(modulePerms).filter(Boolean).length;
    }, 0);
  };

  // Quick preset functions
  const applyAdminPreset = () => {
    setRoleName('Admin');
    setSelectedPermissions(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(moduleName => {
        Object.keys(updated[moduleName]).forEach(actionName => {
          updated[moduleName][actionName] = true;
        });
      });
      return updated;
    });
  };

  const applyManagerPreset = () => {
    setRoleName('Manager');
    const managerModules = ['Dashboard', 'Case Management', 'Animal Care', 'Facility Management', 'Inventory'];
    setSelectedPermissions(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(moduleName => {
        const shouldEnable = managerModules.includes(moduleName);
        Object.keys(updated[moduleName]).forEach(actionName => {
          updated[moduleName][actionName] = shouldEnable;
        });
      });
      return updated;
    });
  };

  const applyViewerPreset = () => {
    setRoleName('Viewer');
    setSelectedPermissions(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(moduleName => {
        Object.keys(updated[moduleName]).forEach(actionName => {
          // Only enable 'View' actions
          updated[moduleName][actionName] = actionName.toLowerCase().includes('view');
        });
      });
      return updated;
    });
  };

  const clearAll = () => {
    setSelectedPermissions(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(moduleName => {
        Object.keys(updated[moduleName]).forEach(actionName => {
          updated[moduleName][actionName] = false;
        });
      });
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Shield className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {existingRole ? 'Edit Role' : 'Create New Role'}
              </h2>
              <p className="text-sm text-gray-500">
                {existingRole ? 'Modify permissions for this role' : 'Define permissions for this role'}
              </p>
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Name */}
            <div>
              <Input
                label="Role Name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Enter role name (e.g., Editor, Viewer)"
                required
                disabled={isLoading}
              />
            </div>

            {/* Quick Presets */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Setup</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={applyAdminPreset}
                  className="text-xs"
                  disabled={isLoading}
                >
                  Admin (All Permissions)
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={applyManagerPreset}
                  className="text-xs"
                  disabled={isLoading}
                >
                  Manager
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={applyViewerPreset}
                  className="text-xs"
                  disabled={isLoading}
                >
                  Viewer (Read Only)
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={clearAll}
                  className="text-xs"
                  disabled={isLoading}
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Permissions</h3>
                <div className="text-sm text-gray-500">
                  {getTotalSelectedCount()} permissions selected
                </div>
              </div>

              <div className="space-y-4">
                {MODULES.map((module) => {
                  const selectedCount = getSelectedCount(module.name);
                  const allSelected = selectedCount === module.actions.length;
                  const someSelected = selectedCount > 0 && selectedCount < module.actions.length;

                  return (
                    <div key={module.name} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Module Header */}
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Users className="h-5 w-5 text-gray-600" />
                            <div>
                              <h4 className="text-md font-medium text-gray-900">{module.name}</h4>
                              <p className="text-sm text-gray-500">
                                {selectedCount}/{module.actions.length} permissions selected
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => toggleAllForModule(module.name)}
                            className="text-xs"
                            disabled={isLoading}
                          >
                            {allSelected ? (
                              <>
                                <Minus className="h-3 w-3 mr-1" />
                                Deselect All
                              </>
                            ) : (
                              <>
                                <Plus className="h-3 w-3 mr-1" />
                                Select All
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {module.actions.map((action) => {
                            const isSelected = selectedPermissions[module.name][action];
                            return (
                              <label
                                key={action}
                                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'border-primary-300 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => togglePermission(module.name, action)}
                                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                  disabled={isLoading}
                                />
                                <span className={`ml-3 text-sm font-medium ${
                                  isSelected ? 'text-primary-900' : 'text-gray-700'
                                }`}>
                                  {action}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {getTotalSelectedCount() > 0 && (
              <span>{getTotalSelectedCount()} permissions selected</span>
            )}
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
              disabled={!roleName.trim() || getTotalSelectedCount() === 0}
            >
              {isLoading ? (existingRole ? 'Updating...' : 'Creating...') : (existingRole ? 'Update Role' : 'Create Role')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleForm;