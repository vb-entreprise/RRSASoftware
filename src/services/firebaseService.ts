import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  Timestamp,
  DocumentData 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Generic interface for documents with common fields
interface BaseDocument {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Document interfaces
export interface User extends BaseDocument {
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export interface TreatmentDay {
  date: string;
  dressing: boolean;
  medication: boolean;
  injectable: boolean;
  surgery: boolean;
  remark: string;
}

export interface CasePaper extends BaseDocument {
  case_number: string;
  date_time: string;
  informer_name: string;
  informer_aadhar: string;
  location: string;
  phone_no: string;
  alternate_phone?: string;
  age: string;
  animal_type: string;
  rescue_by: string;
  sex: string;
  admitted: boolean;
  history?: string;
  symptoms?: string;
  treatment?: string;
  treatment_schedule?: TreatmentDay[];
}

export interface WeeklyMenu extends BaseDocument {
  week_start_date: string;
  meals: {
    [day: string]: {
      lunch: string;
      dinner: string;
    };
  };
}

export interface CleaningRecord extends BaseDocument {
  date: string;
  time: string;
  area: string;
  cleaned: boolean;
  cleaning_level: string;
  cleaned_by: string;
  notes?: string;
}

export interface InventoryRecord extends BaseDocument {
  date_time: string;
  inward_back?: string;
  given_by: string;
  given_to?: string;
  given_for?: string;
  inward_by?: string;
  inward_to?: string;
  received_by?: string;
  item_name: string;
  quantity: number;
  placed_at: string;
  type: 'inward' | 'outward';
  notes?: string;
}

export interface FeedingRecord extends BaseDocument {
  date: string;
  feeding_time: string;
  fed_by: string;
  morning_fed: boolean;
  evening_fed: boolean;
  morning_fed_note?: string;
  evening_fed_note?: string;
  food_type?: string;
  quantity?: string;
  animal_id?: string;
  notes?: string;
}

export interface MediaRecord extends BaseDocument {
  case_id: string;
  date_time: string;
  title: string;
  description: string;
  type: string;
  uploaded_by: string;
  drive_link?: string;
}

export interface Permission {
  module: string;
  actions: {
    name: string;
    enabled: boolean;
  }[];
}

export interface Role extends BaseDocument {
  name: string;
  permissions: Permission[];
}

export interface PermanentAnimal extends BaseDocument {
  animal_type: string;
  name: string;
  sex: string;
  age: string;
  admitted_date: string;
  vaccination_date?: string;
  next_vaccination_due?: string;
  deworming_date?: string;
  next_deworming_due?: string;
  bathing_date?: string;
  tick_treatment_date?: string;
  fasting_date?: string;
  fasting_due_date?: string;
  adoption_date?: string;
  adopted_by?: string;
  contact?: string;
  address?: string;
  aadhar_copy?: string;
  demise_date?: string;
  demise_reason?: string;
  remarks?: string;
}

export interface MaintenanceRecord extends BaseDocument {
  instrument_name: string;
  checked_on: string;
  checked_by: string;
  condition: string;
  problem_description?: string;
  repaired_on?: string;
  repaired_by?: string;
  next_service_due?: string;
  remarks?: string;
}

export interface SpecialEventMedia extends BaseDocument {
  event_name: string;
  date_time: string;
  taken_by: string;
  google_drive_link?: string;
  remark?: string;
}

// Helper function to check if Firebase is configured
const checkFirebaseConnection = () => {
  if (!db) {
    throw new Error('Firebase is not configured. Please update your .env file with valid Firebase credentials.');
  }
};

// Generic CRUD operations
class FirebaseService<T extends BaseDocument> {
  constructor(private collectionName: string) {}

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      checkFirebaseConnection();
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      throw error;
    }
  }

  async getAll(): Promise<T[]> {
    try {
      checkFirebaseConnection();
      const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as T));
    } catch (error) {
      console.error(`Error fetching ${this.collectionName}:`, error);
      if (error instanceof Error && error.message?.includes('Firebase is not configured')) {
        return []; // Return empty array instead of crashing
      }
      throw error;
    }
  }

  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<void> {
    try {
      checkFirebaseConnection();
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      checkFirebaseConnection();
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      throw error;
    }
  }

  async getByField(field: string, value: any): Promise<T[]> {
    try {
      checkFirebaseConnection();
      const q = query(collection(db, this.collectionName), where(field, '==', value));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as T));
    } catch (error) {
      console.error(`Error querying ${this.collectionName}:`, error);
      if (error instanceof Error && error.message?.includes('Firebase is not configured')) {
        return []; // Return empty array instead of crashing
      }
      throw error;
    }
  }
}

// Service instances
export const usersService = new FirebaseService<User>('users');
export const casePapersService = new FirebaseService<CasePaper>('casePapers');
export const weeklyMenusService = new FirebaseService<WeeklyMenu>('weeklyMenus');
export const cleaningRecordsService = new FirebaseService<CleaningRecord>('cleaningRecords');
export const inventoryRecordsService = new FirebaseService<InventoryRecord>('inventoryRecords');
export const feedingRecordsService = new FirebaseService<FeedingRecord>('feedingRecords');
export const mediaRecordsService = new FirebaseService<MediaRecord>('mediaRecords');
export const rolesService = new FirebaseService<Role>('roles');
export const permanentAnimalsService = new FirebaseService<PermanentAnimal>('permanentAnimals');
export const maintenanceRecordsService = new FirebaseService<MaintenanceRecord>('maintenanceRecords');
export const specialEventMediaService = new FirebaseService<SpecialEventMedia>('specialEventMedia');

// Utility function to generate case numbers
export const generateCaseNumber = async (): Promise<string> => {
  try {
    checkFirebaseConnection();
    const casePapers = await casePapersService.getAll();
    
    // Extract numeric parts from existing case numbers and find the highest
    let maxNumber = 0;
    casePapers.forEach(paper => {
      if (paper.case_number && paper.case_number.startsWith('CS-')) {
        const numberPart = paper.case_number.replace('CS-', '');
        const number = parseInt(numberPart, 10);
        if (!isNaN(number) && number > maxNumber) {
          maxNumber = number;
        }
      }
    });
    
    const nextNumber = maxNumber + 1;
    return `CS-${String(nextNumber).padStart(7, '0')}`;
  } catch (error) {
    console.error('Error generating case number:', error);
    // Fallback case number if there's an error
    return `CS-0000001`;
  }
};

// Function to create default roles if they don't exist
export const initializeDefaultRoles = async (): Promise<void> => {
  try {
    checkFirebaseConnection();
    const existingRoles = await rolesService.getAll();
    
    // Check if admin role already exists
    const adminRoleExists = existingRoles.some(role => role.name.toLowerCase() === 'admin');
    
    if (!adminRoleExists) {
      console.log('Creating default admin role...');
      
      // Create comprehensive admin role with all permissions
      const adminRole = {
        name: 'admin',
        permissions: [
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
        ]
      };
      
      await rolesService.create(adminRole);
      console.log('Default admin role created successfully');
    }
    
    // Create other default roles if they don't exist
    const doctorRoleExists = existingRoles.some(role => role.name.toLowerCase() === 'doctor');
    if (!doctorRoleExists) {
      console.log('Creating default doctor role...');
      
      const doctorRole = {
        name: 'doctor',
        permissions: [
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
              { name: 'Delete Cases', enabled: false },
              { name: 'Archive Cases', enabled: true }
            ]
          },
          {
            module: 'Animal Care',
            actions: [
              { name: 'View Care Records', enabled: true },
              { name: 'Add Care Records', enabled: true },
              { name: 'Edit Care Records', enabled: true },
              { name: 'Delete Care Records', enabled: false }
            ]
          },
          {
            module: 'Media Library',
            actions: [
              { name: 'View Media', enabled: true },
              { name: 'Upload Media', enabled: true },
              { name: 'Edit Media', enabled: true },
              { name: 'Delete Media', enabled: false }
            ]
          }
        ]
      };
      
      await rolesService.create(doctorRole);
      console.log('Default doctor role created successfully');
    }
    
    const staffRoleExists = existingRoles.some(role => role.name.toLowerCase() === 'staff');
    if (!staffRoleExists) {
      console.log('Creating default staff role...');
      
      const staffRole = {
        name: 'staff',
        permissions: [
          {
            module: 'Dashboard',
            actions: [
              { name: 'View Dashboard', enabled: true },
              { name: 'View Analytics', enabled: false },
              { name: 'View Reports', enabled: true }
            ]
          },
          {
            module: 'Case Management',
            actions: [
              { name: 'View Cases', enabled: true },
              { name: 'Create Cases', enabled: true },
              { name: 'Edit Cases', enabled: false },
              { name: 'Delete Cases', enabled: false },
              { name: 'Archive Cases', enabled: false }
            ]
          },
          {
            module: 'Animal Care',
            actions: [
              { name: 'View Care Records', enabled: true },
              { name: 'Add Care Records', enabled: true },
              { name: 'Edit Care Records', enabled: false },
              { name: 'Delete Care Records', enabled: false }
            ]
          },
          {
            module: 'Facility Management',
            actions: [
              { name: 'View Cleaning Records', enabled: true },
              { name: 'Add Cleaning Records', enabled: true },
              { name: 'Edit Cleaning Records', enabled: true },
              { name: 'Delete Cleaning Records', enabled: false }
            ]
          },
          {
            module: 'Inventory',
            actions: [
              { name: 'View Inventory', enabled: true },
              { name: 'Add Items', enabled: true },
              { name: 'Edit Items', enabled: false },
              { name: 'Delete Items', enabled: false },
              { name: 'Generate Reports', enabled: false }
            ]
          }
        ]
      };
      
      await rolesService.create(staffRole);
      console.log('Default staff role created successfully');
    }
    
    const photographerRoleExists = existingRoles.some(role => role.name.toLowerCase() === 'photographer');
    if (!photographerRoleExists) {
      console.log('Creating default photographer role...');
      
      const photographerRole = {
        name: 'photographer',
        permissions: [
          {
            module: 'Dashboard',
            actions: [
              { name: 'View Dashboard', enabled: true },
              { name: 'View Analytics', enabled: false },
              { name: 'View Reports', enabled: false }
            ]
          },
          {
            module: 'Media Library',
            actions: [
              { name: 'View Media', enabled: true },
              { name: 'Upload Media', enabled: true },
              { name: 'Edit Media', enabled: true },
              { name: 'Delete Media', enabled: false }
            ]
          }
        ]
      };
      
      await rolesService.create(photographerRole);
      console.log('Default photographer role created successfully');
    }
    
  } catch (error) {
    console.error('Error initializing default roles:', error);
    // Don't throw error to prevent app from crashing
  }
}; 