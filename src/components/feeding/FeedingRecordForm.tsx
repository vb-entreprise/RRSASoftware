import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, User as UserIcon, Utensils, MessageSquare } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { 
  feedingRecordsService, 
  usersService, 
  weeklyMenusService,
  User as UserType,
  WeeklyMenu 
} from '../../services/firebaseService';
import timeZoneService from '../../services/timeZoneService';

interface FeedingRecordFormProps {
  onSubmit: () => void;
  onClose: () => void;
}

const FeedingRecordForm: React.FC<FeedingRecordFormProps> = ({ onSubmit, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentMenu, setCurrentMenu] = useState<WeeklyMenu | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    feedingTime: timeZoneService.getCurrentDateTimeForInput(),
    fedBy: '',
    morningFed: false,
    eveningFed: false,
    morningFedNote: '',
    eveningFedNote: '',
    notes: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchCurrentWeekMenu();
  }, []);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await usersService.getAll();
      setUsers(fetchedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users list');
    }
  };

  const fetchCurrentWeekMenu = async () => {
    try {
      const menus = await weeklyMenusService.getAll();
      
      // Find the menu for the current week
      const now = new Date();
      const currentWeekMenu = menus.find(menu => {
        const menuStartDate = new Date(menu.week_start_date);
        const menuEndDate = new Date(menuStartDate);
        menuEndDate.setDate(menuEndDate.getDate() + 6); // End of week
        
        return now >= menuStartDate && now <= menuEndDate;
      });
      
      setCurrentMenu(currentWeekMenu || null);
    } catch (err) {
      console.error('Error fetching menu:', err);
      // Don't set error for menu fetch failure as it's not critical
    }
  };

  const getCurrentDayMenu = (mealType: 'lunch' | 'dinner') => {
    if (!currentMenu || !formData.date) return null;
    
    const dayKey = formData.date.toLowerCase();
    const dayMenu = currentMenu.meals[dayKey];
    
    if (!dayMenu) return null;
    
    return dayMenu[mealType] || null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.feedingTime || !formData.fedBy) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await feedingRecordsService.create({
        date: formData.date,
        feeding_time: formData.feedingTime,
        fed_by: formData.fedBy,
        morning_fed: formData.morningFed,
        evening_fed: formData.eveningFed,
        morning_fed_note: formData.morningFedNote,
        evening_fed_note: formData.eveningFedNote,
        notes: formData.notes
      });
      
      onSubmit();
    } catch (error) {
      console.error('Error creating feeding record:', error);
      setError('Failed to create feeding record. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Basic Information</span>
          </h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Day *
              </label>
              <select
                value={formData.date}
                onChange={handleInputChange}
                name="date"
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">Select a day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            <Input
              label="Feeding Time *"
              type="datetime-local"
              value={formData.feedingTime}
              onChange={handleInputChange}
              name="feedingTime"
              required
            />

            <div className="sm:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fed By *
                  </label>
                  <select
                    value={formData.fedBy}
                    onChange={handleInputChange}
                    name="fedBy"
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="">Select person who fed</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.name}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feeding Status */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center space-x-2">
            <Utensils className="h-5 w-5" />
            <span>Feeding Status</span>
          </h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Morning Menu (Lunch)</h4>
              <div className="space-y-4">
                {formData.date ? (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {getCurrentDayMenu('lunch') ? (
                      <div>
                        <span className="font-medium">Today's Lunch:</span>
                        <p className="mt-1">{getCurrentDayMenu('lunch')}</p>
                      </div>
                    ) : (
                      <span className="text-gray-500">No lunch menu set for {formData.date}</span>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">Select a day to see the menu</p>
                )}
                
                <label className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.morningFed}
                    onChange={handleInputChange}
                    name="morningFed"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600">Fed according to menu</span>
                </label>
                {!formData.morningFed && (
                  <div className="mt-2">
                    <Input
                      label="What was fed?"
                      type="text"
                      value={formData.morningFedNote}
                      onChange={handleInputChange}
                      name="morningFedNote"
                      placeholder="Enter what was fed in the morning"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Evening Menu (Dinner)</h4>
              <div className="space-y-4">
                {formData.date ? (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {getCurrentDayMenu('dinner') ? (
                      <div>
                        <span className="font-medium">Today's Dinner:</span>
                        <p className="mt-1">{getCurrentDayMenu('dinner')}</p>
                      </div>
                    ) : (
                      <span className="text-gray-500">No dinner menu set for {formData.date}</span>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">Select a day to see the menu</p>
                )}
                
                <label className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.eveningFed}
                    onChange={handleInputChange}
                    name="eveningFed"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600">Fed according to menu</span>
                </label>
                {!formData.eveningFed && (
                  <div className="mt-2">
                    <Input
                      label="What was fed?"
                      type="text"
                      value={formData.eveningFedNote}
                      onChange={handleInputChange}
                      name="eveningFedNote"
                      placeholder="Enter what was fed in the evening"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Notes</span>
          </h3>
          
          <div>
            <textarea
              value={formData.notes}
              onChange={handleInputChange}
              name="notes"
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Add any additional notes about the feeding"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 -mx-6 -mb-6 flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            disabled={isLoading}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={!formData.date || !formData.feedingTime || !formData.fedBy}
          >
            {isLoading ? 'Saving Record...' : 'Save Record'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FeedingRecordForm;