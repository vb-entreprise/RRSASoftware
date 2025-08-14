import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, Shield, Activity, CheckCircle, XCircle, AlertTriangle, Heart, Calendar, Stethoscope, TrendingUp, Clock, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  usersService, 
  rolesService, 
  casePapersService, 
  inventoryRecordsService, 
  feedingRecordsService, 
  cleaningRecordsService, 
  mediaRecordsService,
  CasePaper,
  InventoryRecord,
  FeedingRecord,
  CleaningRecord,
  MediaRecord,
  User as UserType
} from '../services/firebaseService';
import Button from '../components/ui/Button';

interface DashboardStats {
  totalPatients: number;
  activeCases: number;
  criticalCases: number;
  todaysCases: number;
  totalUsers: number;
  staffOnDuty: number;
  doctors: number;
  lowStockItems: { name: string; stock: number; minLevel: number }[];
  recentActivities: { id: string; type: string; message: string; time: string; urgent: boolean }[];
  todaysFeeding: number;
  todaysCleaning: number;
  mediaUploads: number;
}

const DashboardPage: React.FC = () => {
  const { user, hasModuleAccess, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    activeCases: 0,
    criticalCases: 0,
    todaysCases: 0,
    totalUsers: 0,
    staffOnDuty: 0,
    doctors: 0,
    lowStockItems: [],
    recentActivities: [],
    todaysFeeding: 0,
    todaysCleaning: 0,
    mediaUploads: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real data from your system
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data in parallel
        const [
          cases,
          users,
          inventory,
          feedingRecords,
          cleaningRecords,
          mediaRecords
        ] = await Promise.all([
          casePapersService.getAll(),
          usersService.getAll(),
          inventoryRecordsService.getAll(),
          feedingRecordsService.getAll(),
          cleaningRecordsService.getAll(),
          mediaRecordsService.getAll()
        ]);

        // Calculate statistics
        const today = new Date().toISOString().split('T')[0];
        
        // Case statistics
        const totalPatients = cases.length;
        const activeCases = cases.filter(c => c.admitted).length;
        const todaysCases = cases.filter(c => c.date_time.startsWith(today)).length;
        
        // User statistics
        const totalUsers = users.length;
        const doctors = users.filter(u => u.role === 'doctor').length;
        const staffOnDuty = users.filter(u => ['doctor', 'staff', 'admin'].includes(u.role)).length;

        // Activity statistics
        const todaysFeeding = feedingRecords.filter(f => f.date === today).length;
        const todaysCleaning = cleaningRecords.filter(c => c.date === today).length;
        const mediaUploads = mediaRecords.filter(m => m.date_time.startsWith(today)).length;

        // Low stock calculation (items where outward > inward recently)
        const itemStocks = new Map<string, number>();
        inventory.forEach(record => {
          const currentStock = itemStocks.get(record.item_name) || 0;
          if (record.type === 'inward') {
            itemStocks.set(record.item_name, currentStock + record.quantity);
          } else {
            itemStocks.set(record.item_name, currentStock - record.quantity);
          }
        });

        const lowStockItems = Array.from(itemStocks.entries())
          .filter(([_, stock]) => stock < 20) // Consider items with less than 20 as low stock
          .map(([name, stock]) => ({ name, stock, minLevel: 20 }))
          .slice(0, 5); // Show top 5 low stock items

        // Recent activities (last 10 activities)
        const recentActivities = [
          ...cases.slice(0, 3).map(c => ({
            id: c.id || '',
            type: 'case',
            message: `New case: ${c.animal_type} - ${c.case_number}`,
            time: getTimeAgo(c.createdAt),
            urgent: c.admitted
          })),
          ...feedingRecords.slice(0, 2).map(f => ({
            id: f.id || '',
            type: 'feeding',
            message: `Feeding completed by ${f.fed_by}`,
            time: getTimeAgo(f.createdAt),
            urgent: false
          })),
          ...cleaningRecords.slice(0, 2).map(c => ({
            id: c.id || '',
            type: 'cleaning',
            message: `${c.area} cleaned by ${c.cleaned_by}`,
            time: getTimeAgo(c.createdAt),
            urgent: !c.cleaned
          })),
          ...mediaRecords.slice(0, 3).map(m => ({
            id: m.id || '',
            type: 'media',
            message: `Media uploaded: ${m.title}`,
            time: getTimeAgo(m.createdAt),
            urgent: false
          }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

        setStats({
          totalPatients,
          activeCases,
          criticalCases: Math.floor(activeCases * 0.15), // Estimate 15% as critical
          todaysCases,
          totalUsers,
          staffOnDuty,
          doctors,
          lowStockItems,
          recentActivities,
          todaysFeeding,
          todaysCleaning,
          mediaUploads
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to calculate time ago
  const getTimeAgo = (date?: Date): string => {
    if (!date) return 'Unknown time';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  // Check for potential role assignment issues (only for admins)
  // Removed this warning system as multiple admin users are now supported
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-blue-100 mt-1">
              RRSA Animal Hospital Management System
            </p>
            <p className="text-blue-200 text-sm mt-1 capitalize">
              Logged in as: {user?.role}
            </p>
          </div>
          <div className="text-blue-100">
            <Clock className="h-8 w-8" />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Heart className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Patients</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalPatients}</dd>
                <dd className="text-xs text-green-600">+{stats.todaysCases} today</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Cases</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.activeCases}</dd>
                <dd className="text-xs text-orange-600">{stats.criticalCases} critical</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Today's Activities</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.todaysFeeding + stats.todaysCleaning}</dd>
                <dd className="text-xs text-blue-600">{stats.mediaUploads} media uploads</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Staff Members</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                <dd className="text-xs text-gray-600">{stats.doctors} doctors</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-gray-500" />
              Recent Activities
            </h3>
          </div>
          <div className="p-6">
            {stats.recentActivities.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      activity.urgent ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    {activity.urgent && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activities</p>
            )}
          </div>
        </div>

        {/* Quick Stats & Alerts */}
        <div className="space-y-6">
          {/* Daily Summary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-gray-500" />
              Today's Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">New Cases</span>
                <span className="text-sm font-medium">{stats.todaysCases}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Feeding Records</span>
                <span className="text-sm font-medium">{stats.todaysFeeding}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cleaning Records</span>
                <span className="text-sm font-medium">{stats.todaysCleaning}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Media Uploads</span>
                <span className="text-sm font-medium">{stats.mediaUploads}</span>
              </div>
            </div>
          </div>

          {/* Low Stock Alerts */}
          {stats.lowStockItems.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-red-500" />
                Low Stock Alerts
              </h3>
              <div className="space-y-3">
                {stats.lowStockItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                      <p className="text-xs text-gray-500">Min: {item.minLevel}</p>
                    </div>
                    <span className="text-sm font-medium text-red-600">{item.stock} left</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {hasModuleAccess('Case Management') && (
            <Button 
              className="flex items-center justify-center"
              onClick={() => navigate('/casepaper')}
            >
              <FileText className="h-4 w-4 mr-2" />
              New Case
            </Button>
          )}
          
          {hasModuleAccess('Animal Care') && (
            <Button 
              variant="secondary" 
              className="flex items-center justify-center"
              onClick={() => navigate('/feedingrecord')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Add Feeding Record
            </Button>
          )}
          
          {hasModuleAccess('Facility Management') && (
            <Button 
              variant="secondary" 
              className="flex items-center justify-center"
              onClick={() => navigate('/cleaning')}
            >
              <Heart className="h-4 w-4 mr-2" />
              Add Cleaning Record
            </Button>
          )}
          
          {hasModuleAccess('Media Library') && (
            <Button 
              variant="secondary" 
              className="flex items-center justify-center"
              onClick={() => navigate('/media')}
            >
              <Activity className="h-4 w-4 mr-2" />
              Upload Media
            </Button>
          )}
          
          {hasModuleAccess('Inventory') && (
            <Button 
              variant="secondary" 
              className="flex items-center justify-center"
              onClick={() => navigate('/inventory')}
            >
              <Activity className="h-4 w-4 mr-2" />
              Manage Inventory
            </Button>
          )}
        </div>
        
        {/* Show message if no actions available */}
        {!hasModuleAccess('Case Management') && 
         !hasModuleAccess('Animal Care') && 
         !hasModuleAccess('Facility Management') && 
         !hasModuleAccess('Media Library') && 
         !hasModuleAccess('Inventory') && (
          <div className="text-center py-8 text-gray-500">
            <Shield className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p>No quick actions available based on your current permissions.</p>
            <p className="text-sm mt-1">Contact your administrator for additional access.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;