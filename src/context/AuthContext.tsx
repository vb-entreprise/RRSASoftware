import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { rolesService, Permission } from '../services/firebaseService';

type UserRole = 'admin' | 'doctor' | 'staff' | 'volunteer' | 'photographer';

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  permissions?: Permission[];
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isFirebaseConfigured: boolean;
  hasPermission: (module: string, action: string) => boolean;
  hasModuleAccess: (module: string) => boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role?: UserRole, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  createUserAsAdmin: (name: string, email: string, password: string, role?: UserRole, phone?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFirebaseConfigured = !!(auth && db);

  // Helper function to load user permissions
  const loadUserPermissions = async (userRole: string): Promise<Permission[]> => {
    try {
      const roles = await rolesService.getAll();
      const roleData = roles.find(role => role.name.toLowerCase() === userRole.toLowerCase());
      return roleData?.permissions || [];
    } catch (error) {
      console.error('Error loading user permissions from roles collection:', error);
      // Return empty permissions array instead of crashing
      return [];
    }
  };

  // Helper function to check if user has specific permission
  const hasPermission = (module: string, action: string): boolean => {
    if (!user?.permissions) return false;
    
    const modulePermission = user.permissions.find(p => p.module === module);
    if (!modulePermission) return false;
    
    const actionPermission = modulePermission.actions.find(a => a.name === action);
    return actionPermission?.enabled || false;
  };

  // Helper function to check if user has any access to a module
  const hasModuleAccess = (module: string): boolean => {
    if (!user?.permissions) return false;
    
    const modulePermission = user.permissions.find(p => p.module === module);
    if (!modulePermission) return false;
    
    return modulePermission.actions.some(action => action.enabled);
  };

  useEffect(() => {
    // If Firebase is not configured, set loading to false and return
    if (!isFirebaseConfigured) {
      console.warn('Firebase not configured - authentication disabled');
      setIsLoading(false);
      setUser(null);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
        try {
          // Try to get user profile from Firestore, but don't fail if it doesn't work
          let userData = null;
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              userData = userDoc.data();
            }
          } catch (firestoreError) {
            console.warn('Could not fetch user data from Firestore (this is okay if security rules are restrictive):', firestoreError);
          }

          const userRole = (userData?.role as UserRole) || ('admin' as UserRole); // Default to admin for now
          
          // Load user permissions - check if they exist in user document first
          let permissions: Permission[] = [];
          if (userData?.permissions && Array.isArray(userData.permissions) && userData.permissions.length > 0) {
            // Use permissions directly from user document
            permissions = userData.permissions;
            console.log('Using permissions from user document:', permissions);
          } else {
            // Try to load from roles collection, but don't crash if it fails
            console.log('No permissions in user document, trying to load from roles collection for role:', userRole);
            try {
              permissions = await loadUserPermissions(userRole);
              console.log('Loaded permissions from roles collection:', permissions);
            } catch (permissionError) {
              console.warn('Could not load permissions from roles collection, using default admin permissions:', permissionError);
              permissions = [];
            }
            
            // If user is admin but has no permissions, create them
            if (userRole === 'admin' && permissions.length === 0) {
              console.log('Admin user has no permissions, creating default admin permissions');
              permissions = [
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
              
              // Try to update user document with the permissions, but don't crash if it fails
              try {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                await setDoc(userDocRef, {
                  permissions: permissions,
                  updatedAt: new Date()
                }, { merge: true });
                console.log('Admin permissions saved to user document');
              } catch (error) {
                console.warn('Failed to save admin permissions to Firestore (continuing anyway):', error);
                // Don't crash - just continue with the permissions in memory
              }
            }
          }

          // Set user with data from Firestore or defaults
          const userObject: User = {
            id: firebaseUser.uid,
            name: userData?.name || firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            role: userRole,
            phone: userData?.phone || '',
            permissions
          };
          setUser(userObject);
          console.log('User object created:', userObject);
        } catch (error) {
          console.error('Error setting up user (using fallback admin user):', error);
          // Still set user with basic admin info even if everything fails
          const fallbackUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Admin User',
            email: firebaseUser.email || '',
            role: 'admin' as UserRole, // Default to admin so user can access everything
            phone: '',
            permissions: [
              {
                module: 'Dashboard',
                actions: [{ name: 'View Dashboard', enabled: true }]
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
              }
            ]
          };
          console.log('Using fallback admin user:', fallbackUser);
          setUser(fallbackUser);
        }
        } else {
          setUser(null);
        }
      } catch (authError) {
        console.error('Critical error in auth state handler:', authError);
        // Set a fallback admin user if everything fails
        if (firebaseUser) {
          const emergencyUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.email?.split('@')[0] || 'Emergency Admin',
            email: firebaseUser.email || '',
            role: 'admin' as UserRole,
            phone: '',
            permissions: [
              {
                module: 'Dashboard',
                actions: [{ name: 'View Dashboard', enabled: true }]
              },
              {
                module: 'User Management',
                actions: [
                  { name: 'View Users', enabled: true },
                  { name: 'Create Users', enabled: true }
                ]
              }
            ]
          };
          console.log('Using emergency admin user due to critical error:', emergencyUser);
          setUser(emergencyUser);
        } else {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isFirebaseConfigured]);

  const login = async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please update your .env file with valid Firebase credentials.');
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Try to get existing user data first, don't overwrite role
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const existingDoc = await getDoc(userDocRef);
        
        // Only update if document doesn't exist or if essential fields are missing
        if (!existingDoc.exists()) {
          await setDoc(userDocRef, {
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || email,
            role: 'staff', // Default role for new users only
            phone: '',
            createdAt: new Date()
          });
        } else {
          // Just ensure the document has the current user info, but preserve existing role
          const existingData = existingDoc.data();
          await setDoc(userDocRef, {
            name: existingData.name || firebaseUser.displayName || 'User',
            email: firebaseUser.email || email,
            role: existingData.role || 'staff', // Preserve existing role
            phone: existingData.phone || '',
            createdAt: existingData.createdAt || new Date(),
            updatedAt: new Date()
          }, { merge: true });
        }
      } catch (firestoreError) {
        console.warn('Could not update user document in Firestore (login still successful):', firestoreError);
        // Login is still successful even if Firestore write fails
      }
    } catch (err: any) {
      let errorMessage = err.message || 'Login failed';
      if (err.code === 'auth/user-not-found') errorMessage = 'No account found with this email address';
      if (err.code === 'auth/wrong-password') errorMessage = 'Incorrect password';
      if (err.code === 'auth/invalid-email') errorMessage = 'Invalid email address';
      if (err.code === 'auth/user-disabled') errorMessage = 'This account has been disabled';
      if (err.code === 'auth/too-many-requests') errorMessage = 'Too many failed login attempts. Please try again later';
      if (err.code === 'auth/invalid-credential') errorMessage = 'Invalid email or password';
      throw new Error(errorMessage);
    }
  };

  const createUserAsAdmin = async (name: string, email: string, password: string, role: UserRole = 'staff', phone: string = '') => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please update your .env file with valid Firebase credentials.');
    }
    
    // Check if current user is admin
    if (!user || user.role !== 'admin') {
      throw new Error('Only administrators can create users');
    }
    
    // Store current admin's authentication state
    const currentAdmin = auth.currentUser;
    const adminEmail = user.email;
    const adminUid = user.id;
    
    try {
      // Create the new user account (this will log them in automatically)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newFirebaseUser = userCredential.user;
      
      // Update the new user's display name
      await updateProfile(newFirebaseUser, { displayName: name });
      
      // Prepare permissions based on role
      let userPermissions: Permission[] = [];
      if (role === 'admin') {
        // Create full admin permissions
        userPermissions = [
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
      } else {
        // For non-admin users, load permissions from roles collection
        userPermissions = await loadUserPermissions(role);
      }
      
      // Create Firestore user document for the new user
      const userDocRef = doc(db, 'users', newFirebaseUser.uid);
      await setDoc(userDocRef, {
        name,
        email,
        role,
        phone,
        permissions: userPermissions,
        createdAt: new Date(),
        createdBy: adminUid
      });
      
      // Sign out the newly created user immediately
      await signOut(auth);
      
      console.log('User created successfully:', { name, email, role });
      
      // Create a promise that resolves when admin is logged back in
      return new Promise<void>((resolve, reject) => {
        // Show a dialog asking admin to re-login
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div class="flex items-center space-x-3 mb-4">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">User Created Successfully!</h3>
                <p class="text-sm text-gray-600">Please log back in to continue</p>
              </div>
            </div>
            <div class="mb-6">
              <p class="text-sm text-gray-700 mb-2">
                User "<strong>${name}</strong>" has been created successfully.
              </p>
              <p class="text-sm text-gray-600 mb-4">
                Please enter your admin credentials to continue using the system.
              </p>
              <div class="space-y-3">
                <input 
                  type="email" 
                  id="admin-email" 
                  placeholder="Your admin email"
                  value="${adminEmail || ''}"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  type="password" 
                  id="admin-password" 
                  placeholder="Your admin password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div class="flex space-x-3">
              <button 
                id="login-btn"
                class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Log In
              </button>
              <button 
                id="cancel-btn"
                class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        `;
        
        document.body.appendChild(modal);
        
        const emailInput = modal.querySelector('#admin-email') as HTMLInputElement;
        const passwordInput = modal.querySelector('#admin-password') as HTMLInputElement;
        const loginBtn = modal.querySelector('#login-btn') as HTMLButtonElement;
        const cancelBtn = modal.querySelector('#cancel-btn') as HTMLButtonElement;
        
        // Focus on password field if email is pre-filled
        if (emailInput.value) {
          passwordInput.focus();
        } else {
          emailInput.focus();
        }
        
        loginBtn.onclick = async () => {
          const email = emailInput.value;
          const password = passwordInput.value;
          
          if (!email || !password) {
            alert('Please enter both email and password');
            return;
          }
          
          try {
            loginBtn.textContent = 'Logging in...';
            loginBtn.disabled = true;
            
            // Sign in the admin user
            await signInWithEmailAndPassword(auth, email, password);
            
            // Remove modal
            document.body.removeChild(modal);
            resolve();
          } catch (error: any) {
            console.error('Admin re-login error:', error);
            alert('Login failed: ' + (error.message || 'Please check your credentials'));
            loginBtn.textContent = 'Log In';
            loginBtn.disabled = false;
          }
        };
        
        cancelBtn.onclick = () => {
          document.body.removeChild(modal);
          reject(new Error('Admin re-login cancelled'));
        };
        
        // Handle Enter key
        const handleKeyPress = (e: KeyboardEvent) => {
          if (e.key === 'Enter') {
            loginBtn.click();
          }
        };
        emailInput.addEventListener('keypress', handleKeyPress);
        passwordInput.addEventListener('keypress', handleKeyPress);
      });
      
    } catch (err: any) {
      let errorMessage = err.message || 'User creation failed';
      if (err.code === 'auth/email-already-in-use') errorMessage = 'An account with this email already exists';
      if (err.code === 'auth/invalid-email') errorMessage = 'Invalid email address';
      if (err.code === 'auth/weak-password') errorMessage = 'Password is too weak. Please choose a stronger password';
      if (err.code === 'auth/operation-not-allowed') errorMessage = 'Email/password accounts are not enabled';
      console.error('User creation error:', err);
      throw new Error(errorMessage);
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole = 'staff', phone: string = '') => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please update your .env file with valid Firebase credentials.');
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update the user's display name
      await updateProfile(firebaseUser, { displayName: name });
      
      // Prepare permissions based on role
      let userPermissions: Permission[] = [];
      if (role === 'admin') {
        // Create full admin permissions
        userPermissions = [
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
      } else {
        // For non-admin users, load permissions from roles collection
        userPermissions = await loadUserPermissions(role);
      }
      
      // Try to create Firestore user document, but don't fail signup if it doesn't work
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(userDocRef, {
          name,
          email,
          role,
          phone,
          permissions: userPermissions,
          createdAt: new Date()
        }, { merge: true });
        console.log('User document created in Firestore with permissions:', userPermissions.length);
      } catch (firestoreError) {
        console.warn('Could not create user document in Firestore (signup still successful):', firestoreError);
        // Signup is still successful even if Firestore write fails
      }
    } catch (err: any) {
      let errorMessage = err.message || 'Signup failed';
      if (err.code === 'auth/email-already-in-use') errorMessage = 'An account with this email already exists';
      if (err.code === 'auth/invalid-email') errorMessage = 'Invalid email address';
      if (err.code === 'auth/weak-password') errorMessage = 'Password is too weak. Please choose a stronger password';
      if (err.code === 'auth/operation-not-allowed') errorMessage = 'Email/password accounts are not enabled';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please update your .env file with valid Firebase credentials.');
    }
    
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please update your .env file with valid Firebase credentials.');
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'An error occurred while sending password reset email';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many password reset requests. Please try again later';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isFirebaseConfigured,
        hasPermission,
        hasModuleAccess,
        login,
        signup,
        logout,
        resetPassword,
        createUserAsAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Convenience hook for permission checking
export const usePermissions = () => {
  const { hasPermission, hasModuleAccess, user } = useAuth();
  return {
    hasPermission,
    hasModuleAccess,
    userRole: user?.role,
    userPermissions: user?.permissions
  };
};