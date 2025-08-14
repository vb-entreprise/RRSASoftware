# RRSA Software - Animal Rescue Management System

A comprehensive web application for managing animal rescue operations, built with React, TypeScript, and Firebase.

## Features

- 🔐 **Authentication & User Management** - Firebase Auth with role-based access
- 📝 **Case Paper Management** - Track rescue cases and animal information
- 🍽️ **Weekly Menu Planning** - Plan and manage feeding schedules
- 🧹 **Cleaning Records** - Track facility cleaning and maintenance
- 📦 **Inventory Management** - Manage inward/outward inventory items
- 🍲 **Feeding Records** - Track daily feeding activities
- 📸 **Media Management** - Store and organize rescue documentation
- 👥 **User Roles** - Admin, Doctor, and Staff access levels

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth + Firestore)
- **Build Tool**: Vite
- **Icons**: Lucide React

## Prerequisites

- Node.js 16+ and npm
- Firebase project with Authentication and Firestore enabled

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication and Firestore Database

### 2. Configure Authentication

1. In Firebase Console, go to **Authentication > Sign-in method**
2. Enable **Email/Password** provider
3. Add authorized domains if needed

### 3. Configure Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Create database in **production mode** (or test mode for development)
3. Set up the following security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Admin and staff can manage all documents
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'doctor', 'staff'];
    }
  }
}
```

### 4. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings > General**
2. Scroll down to **Your apps** section
3. Click **Add app** and choose **Web**
4. Register your app and copy the config object

## Installation & Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd RRSASoftware
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory and add your Firebase configuration:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Initialize Database Collections

The following collections will be automatically created when you add the first documents:

- `users` - User profiles and roles
- `casePapers` - Rescue case information
- `weeklyMenus` - Weekly feeding schedules
- `cleaningRecords` - Facility cleaning logs
- `inventoryRecords` - Inventory tracking
- `feedingRecords` - Daily feeding logs
- `mediaRecords` - Media file references

### 4. Create Admin User

1. Start the development server:
```bash
npm run dev
```

2. Open the application and register the first user
3. In Firebase Console, go to **Firestore Database**
4. Find the user document in the `users` collection
5. Edit the document and set `role: "admin"`

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── casepaper/       # Case paper forms and components
│   ├── cleaning/        # Cleaning record components
│   ├── feeding/         # Feeding record components
│   ├── inventory/       # Inventory management components
│   ├── layout/          # Layout components
│   ├── media/           # Media management components
│   ├── menu/            # Menu planning components
│   ├── roles/           # Role management components
│   ├── ui/              # Basic UI components
│   └── users/           # User management components
├── config/              # Configuration files
│   └── firebase.ts      # Firebase configuration
├── context/             # React context providers
│   └── AuthContext.tsx  # Authentication context
├── pages/               # Page components
├── services/            # Firebase service layer
│   └── firebaseService.ts
└── App.tsx              # Main app component
```

## User Roles

- **Admin**: Full access to all features and user management
- **Doctor**: Access to medical records and case management
- **Staff**: Access to daily operations (feeding, cleaning, inventory)

## Security Features

- Firebase Authentication with email/password
- Role-based access control
- Firestore security rules
- Protected routes based on authentication status

## Data Models

### Case Paper
- Case number, date/time, informer details
- Animal information, rescue details
- Medical history, symptoms, treatment
- Admission status and location

### Weekly Menu
- Week start date
- Daily meals (breakfast, lunch, dinner) for each day

### Cleaning Record
- Date, area, cleaning level
- Cleaned by, completion status, notes

### Inventory Record
- Date/time, item details, quantity
- Given by/received by, placement location
- Type (inward/outward), notes

### Feeding Record
- Date, feeding time, fed by
- Morning/evening status, food type
- Animal ID, quantity, notes

### Media Record
- Case ID, date/time, title/description
- Media type, uploaded by
- Drive link for file storage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions, please create an issue in the repository or contact the development team.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 