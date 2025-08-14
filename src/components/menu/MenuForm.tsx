import React, { useState } from 'react';
import { AlertCircle, Calendar, Sun, Moon } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { weeklyMenusService } from '../../services/firebaseService';
import timeZoneService from '../../services/timeZoneService';

interface MenuFormProps {
  onSubmit: () => void;
  onClose: () => void;
}

const MenuForm: React.FC<MenuFormProps> = ({ onSubmit, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    weekStartDate: timeZoneService.getCurrentDateForInput(),
    meals: {
      monday: { lunch: '', dinner: '' },
      tuesday: { lunch: '', dinner: '' },
      wednesday: { lunch: '', dinner: '' },
      thursday: { lunch: '', dinner: '' },
      friday: { lunch: '', dinner: '' },
      saturday: { lunch: '', dinner: '' },
      sunday: { lunch: '', dinner: '' }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.weekStartDate) {
      setError('Please select a week starting date');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await weeklyMenusService.create({
        week_start_date: formData.weekStartDate,
        meals: formData.meals
      });
      
      onSubmit();
    } catch (error) {
      console.error('Error creating menu:', error);
      setError('Failed to create menu. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMealChange = (day: keyof typeof formData.meals, meal: 'lunch' | 'dinner', value: string) => {
    setFormData(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [day]: {
          ...prev.meals[day],
          [meal]: value,
        },
      }
    }));
  };

  const getMealIcon = (meal: string) => {
    switch (meal) {
      case 'lunch':
        return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'dinner':
        return <Moon className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const renderDayInputs = (day: keyof typeof formData.meals, label: string) => {
    const meals: Array<'lunch' | 'dinner'> = ['lunch', 'dinner'];
    
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 flex items-center space-x-2 mb-3 sm:mb-4">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
          <span>{label}</span>
        </h3>
        <div className="space-y-3 sm:space-y-4">
          {meals.map((meal) => (
            <div key={meal} className="relative">
              <div className="absolute left-2 sm:left-3 top-[38px]">
                {getMealIcon(meal)}
              </div>
              <Input
                label={meal.charAt(0).toUpperCase() + meal.slice(1)}
                type="text"
                value={formData.meals[day][meal]}
                onChange={(e) => handleMealChange(day, meal, e.target.value)}
                placeholder={`Enter ${meal} menu`}
                className="pl-8 sm:pl-10"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6">
      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start sm:items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 sm:mt-0" />
            <p className="text-xs sm:text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border border-blue-200">
          <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3 sm:mb-4 flex items-center space-x-2">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Week Information</span>
          </h3>
          
          <div className="max-w-md">
            <Input
              label="Week Starting Date"
              type="date"
              value={formData.weekStartDate}
              onChange={(e) => setFormData(prev => ({ ...prev, weekStartDate: e.target.value }))}
              required
              error={!formData.weekStartDate ? 'Please select a starting date' : ''}
            />
            {formData.weekStartDate && (
              <p className="mt-2 text-xs sm:text-sm text-gray-600">
                Week ending: {new Date(new Date(formData.weekStartDate).getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {renderDayInputs('monday', 'Monday')}
          {renderDayInputs('tuesday', 'Tuesday')}
          {renderDayInputs('wednesday', 'Wednesday')}
          {renderDayInputs('thursday', 'Thursday')}
          {renderDayInputs('friday', 'Friday')}
          {renderDayInputs('saturday', 'Saturday')}
          {renderDayInputs('sunday', 'Sunday')}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <Button
            type="button"
            variant="secondary"
            disabled={isLoading}
            onClick={onClose}
            className="w-full sm:w-auto justify-center"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={!formData.weekStartDate}
            className="w-full sm:w-auto justify-center"
          >
            {isLoading ? 'Saving Menu...' : 'Save Menu'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MenuForm;