import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPn5yVsGuLxc8cD-21l9BjTPPXxU8zfCY",
  authDomain: "rrsaindia-vb-new.firebaseapp.com",
  projectId: "rrsaindia-vb-new",
  storageBucket: "rrsaindia-vb-new.firebasestorage.app",
  messagingSenderId: "157976902882",
  appId: "1:157976902882:web:db4d1cde009f68d0d132bb"
};

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);
  
  if (missingKeys.length > 0) {
    console.warn('Firebase configuration incomplete. Please update your .env file with Firebase credentials.');
    return false;
  }
  
  return true;
};

// Function to initialize basic collections
const initializeDatabase = async () => {
  if (!db) return;
  
  try {
    // Create a dummy document to initialize collections
    await setDoc(doc(db, 'system', 'initialized'), {
      initialized: true,
      createdAt: new Date(),
      version: '1.0.0'
    });
    console.log('Database collections initialized');
  } catch (error) {
    console.warn('Could not initialize database collections:', error);
  }
};

// Check configuration and conditionally initialize Firebase
const isConfigured = validateFirebaseConfig();

let app: any = null;
let auth: any = null;
let db: any = null;

if (isConfigured) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    
    // Initialize Firebase Authentication and get a reference to the service
    auth = getAuth(app);
    
    // Initialize Cloud Firestore and get a reference to the service
    db = getFirestore(app);
    
    console.log('Firebase services initialized successfully');
    
    // Initialize database collections (run once)
    initializeDatabase();
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
}

// Export with null checks for graceful degradation
export { auth, db };
export default app; 