import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { rolesService } from '../../services/firebaseService';

const FirebaseDebug: React.FC = () => {
  const { user, hasModuleAccess } = useAuth();
  const [roles, setRoles] = useState<any[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const loadDebugInfo = async () => {
      try {
        const allRoles = await rolesService.getAll();
        setRoles(allRoles);
        
        const modules = [
          'Dashboard',
          'Case Management', 
          'User Management',
          'Role Management',
          'Animal Care',
          'Facility Management',
          'Inventory',
          'Media Library'
        ];
        
        const moduleAccess: Record<string, boolean> = {};
        modules.forEach(module => {
          moduleAccess[module] = hasModuleAccess(module);
        });
        
        setDebugInfo({
          userRole: user?.role,
          userPermissions: user?.permissions,
          moduleAccess,
          totalRoles: allRoles.length
        });
      } catch (error) {
        console.error('Debug info error:', error);
      }
    };

    if (user) {
      loadDebugInfo();
    }
  }, [user, hasModuleAccess]);

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <div className="text-xs">
        <h3 className="font-bold mb-2">Debug Info</h3>
        <div><strong>Role:</strong> {debugInfo.userRole}</div>
        <div><strong>Permissions:</strong> {user.permissions?.length || 0}</div>
        <div><strong>Total Roles:</strong> {debugInfo.totalRoles}</div>
        
        <div className="mt-2">
          <strong>Module Access:</strong>
          <div className="text-xs">
            {Object.entries(debugInfo.moduleAccess || {}).map(([module, access]) => (
              <div key={module} className={access ? 'text-green-600' : 'text-red-600'}>
                {module}: {access ? '✓' : '✗'}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-2">
          <strong>Available Roles:</strong>
          <div className="text-xs">
            {roles.map(role => (
              <div key={role.id}>
                {role.name} ({role.permissions?.length || 0} perms)
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseDebug; 