import React, { useState, useEffect } from 'react';
import { AlertCircle, Trash2, CheckCircle, ClipboardList } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { cleaningRecordsService, usersService, User as UserType } from '../../services/firebaseService';
import timeZoneService from '../../services/timeZoneService';

interface CleaningArea {
  id: string;
  name: string;
  cleaned: boolean;
  cleanedBy: string;
  cleaningScale: 'Good' | 'Avg' | 'Bad' | '';
  remarks: string;
}

interface FormData {
  date: string;
  time: string;
  areas: CleaningArea[];
}

interface CleaningFormProps {
  onSubmit: () => void;
  onClose: () => void;
}

const CLEANING_AREAS = [
  { id: 'large_animal_ward', name: 'Large Animal Ward' },
  { id: 'admin_office', name: 'Admin Office' },
  { id: 'founders_cabin', name: "Founder's Cabin" },
  { id: 'full_ground', name: 'Full Ground' },
  { id: 'animal_caretaker_family', name: 'Animal Caretaker Family' },
  { id: 'permanent_dogs_home', name: 'Permanent Dogs Home' },
  { id: 'geetis_home', name: "Geeti's Home" },
  { id: 'ot', name: 'OT' },
  { id: 'radiology_room', name: 'Radiology Room' },
  { id: 'bird_room_1', name: 'Bird Room 1' },
  { id: 'bird_room_2', name: 'Bird Room 2' },
  { id: 'opd_area', name: 'OPD Area' },
  { id: 'dressing_area', name: 'Dressing Area' },
  { id: 'food_storage_room', name: 'Food Storage Room' },
  { id: 'medicine_room', name: 'Medicine Room' },
  { id: 'a_block', name: 'A Block' },
  { id: 'b_block', name: 'B Block' },
  { id: 'c_block', name: 'C Block' },
  { id: 'outer_space', name: 'Outer Space' }
];

const CleaningForm: React.FC<CleaningFormProps> = ({ onSubmit, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [formData, setFormData] = useState<FormData>({
    date: timeZoneService.getCurrentDateForInput(),
    time: timeZoneService.getCurrentTimeForInput(),
    areas: CLEANING_AREAS.map(area => ({
      id: area.id,
      name: area.name,
      cleaned: false,
      cleanedBy: '',
      cleaningScale: '',
      remarks: ''
    }))
  });

  useEffect(() => {
    fetchUsers();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const cleanedAreas = formData.areas.filter(area => area.cleaned);
      
      if (cleanedAreas.length === 0) {
        setError('Please mark at least one area as cleaned');
        setIsLoading(false);
        return;
      }

      // Validate that all cleaned areas have a cleaning scale
      const invalidArea = cleanedAreas.find(area => !area.cleaningScale);
      if (invalidArea) {
        setError(`Please select a cleaning scale for ${invalidArea.name}`);
        setIsLoading(false);
        return;
      }

      await Promise.all(cleanedAreas.map(area => 
        cleaningRecordsService.create({
          date: formData.date,
          time: formData.time,
          area: area.name,
          cleaned: true,
          cleaned_by: area.cleanedBy,
          cleaning_level: area.cleaningScale,
          notes: area.remarks
        })
      ));
      
      onSubmit();
    } catch (error) {
      console.error('Error creating cleaning records:', error);
      setError('Failed to create cleaning records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAreaChange = (areaId: string, field: keyof CleaningArea, value: any) => {
    setFormData(prev => ({
      ...prev,
      areas: prev.areas.map(area => 
        area.id === areaId ? { ...area, [field]: value } : area
      )
    }));
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:space-x-4">
          <div className="flex-1">
            <Input
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>
          <div className="flex-1">
            <Input
              label="Time"
              type="time"
              name="time"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {formData.areas.map((area) => (
            <div key={area.id} className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-3 mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">{area.name}</h3>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={area.cleaned}
                      onChange={(e) => handleAreaChange(area.id, 'cleaned', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-xs sm:text-sm text-gray-600">
                      {area.cleaned ? 'Cleaned' : 'Not cleaned'}
                    </span>
                  </div>
                </div>

                {area.cleaned && (
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Cleaning Scale
                      </label>
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name={`cleaningScale-${area.id}`}
                            value="Good"
                            checked={area.cleaningScale === 'Good'}
                            onChange={(e) => handleAreaChange(area.id, 'cleaningScale', e.target.value)}
                            className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-xs sm:text-sm text-gray-700">Good</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name={`cleaningScale-${area.id}`}
                            value="Avg"
                            checked={area.cleaningScale === 'Avg'}
                            onChange={(e) => handleAreaChange(area.id, 'cleaningScale', e.target.value)}
                            className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-xs sm:text-sm text-gray-700">Avg</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name={`cleaningScale-${area.id}`}
                            value="Bad"
                            checked={area.cleaningScale === 'Bad'}
                            onChange={(e) => handleAreaChange(area.id, 'cleaningScale', e.target.value)}
                            className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-xs sm:text-sm text-gray-700">Bad</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Cleaned By
                      </label>
                      <select
                        value={area.cleanedBy}
                        onChange={(e) => handleAreaChange(area.id, 'cleanedBy', e.target.value)}
                        required={area.cleaned}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-xs sm:text-sm"
                      >
                        <option value="">Select person who cleaned</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.name}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Remarks
                      </label>
                      <textarea
                        value={area.remarks}
                        onChange={(e) => handleAreaChange(area.id, 'remarks', e.target.value)}
                        rows={2}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-xs sm:text-sm"
                        placeholder="Add any remarks about the cleaning"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
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
            className="w-full sm:w-auto justify-center"
          >
            {isLoading ? 'Saving Records...' : 'Save Records'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CleaningForm;