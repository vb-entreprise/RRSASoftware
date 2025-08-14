import React, { useState, useEffect } from 'react';
import { 
  Package,
  ArrowDown,
  ArrowUp,
  Boxes,
  ClipboardList,
  Brush,
  FileText
} from 'lucide-react';
import { 
  inventoryRecordsService, 
  casePapersService, 
  cleaningRecordsService,
  InventoryRecord,
  CasePaper,
  CleaningRecord
} from '../../services/firebaseService';

const DashboardSummary: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalInward: 0,
    totalOutward: 0,
    totalCases: 0,
    cleaningToday: 0
  });
  const [recentInventory, setRecentInventory] = useState<InventoryRecord[]>([]);
  const [recentCases, setRecentCases] = useState<CasePaper[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all records
      const [inventory, cases, cleaning] = await Promise.all([
        inventoryRecordsService.getAll(),
        casePapersService.getAll(),
        cleaningRecordsService.getAll()
      ]);

      // Calculate stats
      const inwardCount = inventory.filter(record => record.type === 'inward').length;
      const outwardCount = inventory.filter(record => record.type === 'outward').length;
      
      // Get today's date for cleaning records
      const today = new Date().toISOString().split('T')[0];
      const cleaningTodayCount = cleaning.filter(record => 
        record.date.split('T')[0] === today
      ).length;

      setStats({
        totalInward: inwardCount,
        totalOutward: outwardCount,
        totalCases: cases.length,
        cleaningToday: cleaningTodayCount
      });

      // Get recent records
      setRecentInventory(inventory
        .sort((a, b) => {
          const timeA = a.createdAt?.getTime() || 0;
          const timeB = b.createdAt?.getTime() || 0;
          return timeB - timeA;
        })
        .slice(0, 5)
      );
      
      setRecentCases(cases
        .sort((a, b) => {
          const timeA = a.createdAt?.getTime() || 0;
          const timeB = b.createdAt?.getTime() || 0;
          return timeB - timeA;
        })
        .slice(0, 5)
      );

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const statsCards = [
    { 
      id: 1, 
      name: 'Total Inward', 
      value: stats.totalInward.toString(), 
      icon: ArrowDown, 
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    { 
      id: 2, 
      name: 'Total Outward', 
      value: stats.totalOutward.toString(), 
      icon: ArrowUp, 
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600', 
    },
    { 
      id: 3, 
      name: 'Total Cases', 
      value: stats.totalCases.toString(), 
      icon: FileText, 
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600', 
    },
    { 
      id: 4, 
      name: 'Cleaning Today', 
      value: stats.cleaningToday.toString(), 
      icon: Brush, 
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600', 
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((item) => (
          <div key={item.id} className="card transition-transform hover:translate-y-[-4px]">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{item.name}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{item.value}</p>
              </div>
              <div className={`${item.iconBg} ${item.iconColor} p-3 rounded-full`}>
                <item.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Inventory */}
        <div className="card animate-in">
          <h2 className="text-lg font-medium text-gray-900">Recent Inventory</h2>
          <div className="mt-4 overflow-hidden">
            <div className="flex flex-col">
              <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Item</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Quantity</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {recentInventory.map((record) => (
                          <tr key={record.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {record.item_name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                record.type === 'inward' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {record.quantity}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {new Date(record.date_time).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Cases */}
        <div className="card animate-in">
          <h2 className="text-lg font-medium text-gray-900">Recent Cases</h2>
          <div className="mt-4 overflow-hidden">
            <div className="flex flex-col">
              <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Case No.</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Animal</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Location</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {recentCases.map((record) => (
                          <tr key={record.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {record.case_number}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {record.animal_type}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {record.location}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                record.admitted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {record.admitted ? 'Admitted' : 'OPD'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;