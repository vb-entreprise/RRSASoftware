import React, { useState, useEffect } from 'react';
import { Plus, Eye, Pencil, X, Trash2, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import MenuForm from '../components/menu/MenuForm';
import { weeklyMenusService, WeeklyMenu } from '../services/firebaseService';

const MenuPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<WeeklyMenu | null>(null);
  const [menus, setMenus] = useState<WeeklyMenu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setIsLoading(true);
      const fetchedMenus = await weeklyMenusService.getAll();
      setMenus(fetchedMenus.sort((a, b) => 
        new Date(b.week_start_date).getTime() - new Date(a.week_start_date).getTime()
      ));
      setError(null);
    } catch (err) {
      console.error('Error fetching menus:', err);
      setError('Failed to fetch menus');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (menuId: string) => {
    try {
      await weeklyMenusService.delete(menuId);
      setShowDeleteConfirm(false);
      setSelectedMenu(null);
      await fetchMenus();
    } catch (err) {
      console.error('Error deleting menu:', err);
      setError('Failed to delete menu');
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    fetchMenus();
  };

  const renderViewModal = () => {
    if (!selectedMenu) return null;

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const meals = ['lunch', 'dinner'];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Weekly Menu Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                Week Starting: {new Date(selectedMenu.week_start_date).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => {
                setShowViewModal(false);
                setSelectedMenu(null);
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid gap-6">
              {days.map((day) => (
                <div key={day} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 capitalize mb-4">{day}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {meals.map((meal) => (
                      <div key={meal} className="bg-white p-4 rounded-lg border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 capitalize mb-2">{meal}</h4>
                        <p className="text-sm text-gray-600">
                          {selectedMenu.meals[day as keyof typeof selectedMenu.meals][meal as 'lunch' | 'dinner'] || 'Not specified'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDeleteConfirmation = () => {
    if (!selectedMenu) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Delete Weekly Menu
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete the menu for week starting {new Date(selectedMenu.week_start_date).toLocaleDateString()}? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedMenu(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => selectedMenu.id && handleDelete(selectedMenu.id)}
              >
                Delete Menu
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Weekly Menus</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage weekly meal schedules for lunch and dinner.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button onClick={() => setShowForm(true)} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add New Menu
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
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
                        Week Starting
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Created At
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {menus.map((menu) => {
                      const startDate = new Date(menu.week_start_date);
                      const endDate = new Date(startDate);
                      endDate.setDate(endDate.getDate() + 6);
                      const isCurrentWeek = startDate <= new Date() && endDate >= new Date();

                      return (
                        <tr key={menu.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <div className="font-medium text-gray-900">
                              {startDate.toLocaleDateString()}
                            </div>
                            <div className="text-gray-500">
                              to {endDate.toLocaleDateString()}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {menu.createdAt ? new Date(menu.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              isCurrentWeek
                                ? 'bg-green-100 text-green-800'
                                : startDate > new Date()
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {isCurrentWeek ? 'Current Week' : startDate > new Date() ? 'Upcoming' : 'Past'}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button 
                              onClick={() => {
                                setSelectedMenu(menu);
                                setShowViewModal(true);
                              }}
                              className="text-primary-600 hover:text-primary-900 mr-3"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              className="text-primary-600 hover:text-primary-900 mr-3"
                              title="Edit Menu"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedMenu(menu);
                                setShowDeleteConfirm(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Menu"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-7xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">New Weekly Menu</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <MenuForm onSubmit={handleFormSubmit} onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {showViewModal && renderViewModal()}
      {showDeleteConfirm && renderDeleteConfirmation()}
    </>
  );
};

export default MenuPage;