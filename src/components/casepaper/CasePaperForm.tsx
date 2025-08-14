import React, { useState, useEffect } from 'react';
import { Plus, FileText, User, MapPin, Phone, Calendar, Stethoscope, ClipboardList, AlertCircle, Clock, Heart, Activity, Trash2, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { usersService, casePapersService, generateCaseNumber, CasePaper, TreatmentDay } from '../../services/firebaseService';
import { useAuth } from '../../context/AuthContext';
import timeZoneService from '../../services/timeZoneService';

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface CasePaperFormProps {
  onSubmit: () => void;
  onClose: () => void;
  casePaper?: CasePaper; // Optional for edit mode
}

const CasePaperForm: React.FC<CasePaperFormProps> = ({ onSubmit, onClose, casePaper }) => {
  const { user } = useAuth();
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [treatmentDays, setTreatmentDays] = useState<TreatmentDay[]>(
    casePaper?.treatment_schedule || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const isEditMode = !!casePaper;

  const [formData, setFormData] = useState({
    dateTime: casePaper?.date_time || timeZoneService.getCurrentDateTimeForInput(),
    caseNo: casePaper?.case_number || '',
    informerName: casePaper?.informer_name || '',
    informerAadhar: casePaper?.informer_aadhar || '',
    location: casePaper?.location || '',
    phoneNo: casePaper?.phone_no || '',
    alternatePhone: casePaper?.alternate_phone || '',
    age: casePaper?.age || '',
    animalType: casePaper?.animal_type || '',
    rescueBy: casePaper?.rescue_by || '',
    sex: casePaper?.sex || '',
    admitted: casePaper?.admitted ? 'yes' : 'no',
    history: casePaper?.history || '',
    symptoms: casePaper?.symptoms || '',
    treatment: casePaper?.treatment || ''
  });

  const animalTypes = [
    { value: 'dog', label: '🐕 Dog', icon: '🐕' },
    { value: 'cat', label: '🐱 Cat', icon: '🐱' },
    { value: 'cow', label: '🐄 Cow', icon: '🐄' },
    { value: 'bird', label: '🐦 Bird', icon: '🐦' },
    { value: 'horse', label: '🐎 Horse', icon: '🐎' },
    { value: 'goat', label: '🐐 Goat', icon: '🐐' },
    { value: 'pig', label: '🐷 Pig', icon: '🐷' },
    { value: 'other', label: '🔍 Other', icon: '🔍' }
  ];

  useEffect(() => {
    fetchRegisteredUsers();
    if (!isEditMode) {
      generateAndSetCaseNumber();
    } else if (casePaper?.treatment_schedule) {
      // Populate treatment schedule when editing
      setTreatmentDays(casePaper.treatment_schedule);
    }
  }, [isEditMode, casePaper]);

  const fetchRegisteredUsers = async () => {
    try {
      const users = await usersService.getAll();
      const validUsers = users
        .filter((user): user is typeof user & { id: string } => !!user.id)
        .map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }));
      setRegisteredUsers(validUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const generateAndSetCaseNumber = async () => {
    try {
      const caseNumber = await generateCaseNumber();
      setFormData(prev => ({
        ...prev,
        caseNo: caseNumber
      }));
    } catch (error) {
      console.error('Error generating case number:', error);
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Required field validations
    if (!formData.dateTime) errors.dateTime = 'Date and time is required';
    if (!formData.informerName.trim()) errors.informerName = 'Informer name is required';
    if (!formData.informerAadhar.trim()) errors.informerAadhar = 'Aadhar number is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.phoneNo.trim()) errors.phoneNo = 'Phone number is required';
    if (!formData.age.trim()) errors.age = 'Animal age is required';
    if (!formData.animalType) errors.animalType = 'Animal type is required';
    if (!formData.rescueBy) errors.rescueBy = 'Rescuer selection is required';
    if (!formData.sex) errors.sex = 'Animal sex is required';

    // Treatment days validation
    if (treatmentDays.length > 0) {
      const hasInvalidTreatmentDay = treatmentDays.some(day => {
        return !day.date || (!day.dressing && !day.medication && !day.injectable && !day.surgery);
      });
      if (hasInvalidTreatmentDay) {
        errors.treatmentDays = 'Each treatment day must have a date and at least one treatment type selected';
      }
    }

    // Aadhar validation (12 digits)
    if (formData.informerAadhar && !/^\d{12}$/.test(formData.informerAadhar.replace(/\s/g, ''))) {
      errors.informerAadhar = 'Aadhar number must be 12 digits';
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{9,15}$/;
    if (formData.phoneNo && !phoneRegex.test(formData.phoneNo.replace(/[\s\-\(\)]/g, ''))) {
      errors.phoneNo = 'Please enter a valid phone number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please correct the errors above before submitting');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const casePaperData = {
        case_number: formData.caseNo,
        date_time: formData.dateTime,
        informer_name: formData.informerName,
        informer_aadhar: formData.informerAadhar,
        location: formData.location,
        phone_no: formData.phoneNo,
        alternate_phone: formData.alternatePhone,
        age: formData.age,
        animal_type: formData.animalType,
        rescue_by: formData.rescueBy,
        sex: formData.sex,
        admitted: formData.admitted === 'yes',
        history: formData.history,
        symptoms: formData.symptoms,
        treatment: formData.treatment,
        treatment_schedule: treatmentDays.length > 0 ? treatmentDays : undefined
      };

      console.log('Saving case paper with treatment schedule:', casePaperData.treatment_schedule);

      if (isEditMode && casePaper?.id) {
        await casePapersService.update(casePaper.id, casePaperData);
      } else {
        await casePapersService.create(casePaperData);
      }
      
      onSubmit();
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} case paper:`, error);
      setError(`Failed to ${isEditMode ? 'update' : 'create'} case paper. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTreatmentDayChange = (index: number, field: keyof TreatmentDay, value: string | boolean) => {
    setTreatmentDays(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const addTreatmentDay = () => {
    setTreatmentDays(prev => [
      ...prev,
      {
        date: timeZoneService.getCurrentDateTimeForInput(), // Set current date/time as default
        dressing: false,
        medication: false,
        injectable: false,
        surgery: false,
        remark: '',
      },
    ]);
  };

  const removeTreatmentDay = (index: number) => {
    setTreatmentDays(prev => prev.filter((_, i) => i !== index));
  };

  const fillDemoData = () => {
    setFormData({
      ...formData,
      informerName: 'John Doe',
      informerAadhar: '123456789012',
      location: 'MG Road, Bangalore',
      phoneNo: '+91 9876543210',
      alternatePhone: '+91 9876543211',
      age: '2 years',
      animalType: 'dog',
      rescueBy: registeredUsers.length > 0 ? registeredUsers[0].name : '',
      sex: 'male',
      admitted: 'yes',
      history: 'Animal found injured on road side with visible wounds',
      symptoms: 'Limping, visible cuts on front leg, appears dehydrated',
      treatment: 'Cleaned wounds, applied antiseptic, administered pain medication'
    });
  };

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-green-50 border-b border-gray-200 px-6 py-4 z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode ? 'Edit Animal Rescue Case Paper' : 'Animal Rescue Case Paper'}
            </h2>
            <p className="text-sm text-gray-600">
              {isEditMode ? 'Update case details and information' : 'Document and track animal rescue case details'}
            </p>
          </div>
        </div>
      </div>

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
          {/* Quick Actions */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              {!isEditMode && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={fillDemoData}
                  className="text-xs"
                  disabled={isLoading}
                >
                  Fill Demo Data
                </Button>
              )}
              {!isEditMode && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={generateAndSetCaseNumber}
                  className="text-xs"
                  disabled={isLoading}
                >
                  Generate New Case Number
                </Button>
              )}
            </div>
          </div>

          {/* Basic Case Information */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Case Information</span>
            </h3>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                label="Date and Time *"
                type="datetime-local"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleInputChange}
                required
                error={validationErrors.dateTime}
                disabled={isLoading}
              />

              <Input
                label="Case Number"
                type="text"
                name="caseNo"
                value={formData.caseNo}
                onChange={handleInputChange}
                disabled
                className="bg-gray-100"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rescue By Whom *
                </label>
                <select
                  name="rescueBy"
                  value={formData.rescueBy}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className={`block w-full rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
                    validationErrors.rescueBy
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  } disabled:bg-gray-100 disabled:text-gray-500`}
                >
                  <option value="">Select rescuer</option>
                  {registeredUsers.map(user => (
                    <option key={user.id} value={user.name}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
                {validationErrors.rescueBy && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.rescueBy}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informer Details */}
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Informer Details</span>
            </h3>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                label="Informer Name *"
                type="text"
                name="informerName"
                value={formData.informerName}
                onChange={handleInputChange}
                required
                placeholder="Enter full name"
                error={validationErrors.informerName}
                disabled={isLoading}
              />

              <Input
                label="Aadhar Number *"
                type="text"
                name="informerAadhar"
                value={formData.informerAadhar}
                onChange={handleInputChange}
                required
                placeholder="xxxx xxxx xxxx"
                error={validationErrors.informerAadhar}
                disabled={isLoading}
                maxLength={14}
              />

              <Input
                label="Phone Number *"
                type="tel"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleInputChange}
                required
                placeholder="+91 98765 43210"
                error={validationErrors.phoneNo}
                disabled={isLoading}
              />

              <Input
                label="Alternate Phone"
                type="tel"
                name="alternatePhone"
                value={formData.alternatePhone}
                onChange={handleInputChange}
                placeholder="Backup contact number"
                disabled={isLoading}
              />

              <div className="sm:col-span-2">
                <Input
                  label="Location of Animal *"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="Street, area, landmark, city"
                  error={validationErrors.location}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Animal Details */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center space-x-2">
              <Heart className="h-5 w-5" />
              <span>Animal Details</span>
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Animal Type *
                  </label>
                  <select
                    name="animalType"
                    value={formData.animalType}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className={`block w-full rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm ${
                      validationErrors.animalType
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                    } disabled:bg-gray-100 disabled:text-gray-500`}
                  >
                    <option value="">Select animal type</option>
                    {animalTypes.map(animal => (
                      <option key={animal.value} value={animal.value}>
                        {animal.label}
                      </option>
                    ))}
                  </select>
                  {validationErrors.animalType && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.animalType}</p>
                  )}
                </div>

                <Input
                  label="Age of Animal *"
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 2 years, 6 months"
                  error={validationErrors.age}
                  disabled={isLoading}
                />

                <div></div> {/* Empty div for grid alignment */}
              </div>

              {/* Radio Button Groups */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Sex of Animal *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="sex"
                        value="male"
                        checked={formData.sex === 'male'}
                        onChange={(e) => handleRadioChange('sex', e.target.value)}
                        className="form-radio text-green-600 h-4 w-4"
                        disabled={isLoading}
                      />
                      <span className="ml-3 text-sm text-gray-700">♂️ Male</span>
                    </label>
                    <label className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="sex"
                        value="female"
                        checked={formData.sex === 'female'}
                        onChange={(e) => handleRadioChange('sex', e.target.value)}
                        className="form-radio text-green-600 h-4 w-4"
                        disabled={isLoading}
                      />
                      <span className="ml-3 text-sm text-gray-700">♀️ Female</span>
                    </label>
                  </div>
                  {validationErrors.sex && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.sex}</p>
                  )}
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Admitted at Shelter
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="admitted"
                        value="yes"
                        checked={formData.admitted === 'yes'}
                        onChange={(e) => handleRadioChange('admitted', e.target.value)}
                        className="form-radio text-green-600 h-4 w-4"
                        disabled={isLoading}
                      />
                      <span className="ml-3 text-sm text-gray-700">✅ Yes</span>
                    </label>
                    <label className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="admitted"
                        value="no"
                        checked={formData.admitted === 'no'}
                        onChange={(e) => handleRadioChange('admitted', e.target.value)}
                        className="form-radio text-green-600 h-4 w-4"
                        disabled={isLoading}
                      />
                      <span className="ml-3 text-sm text-gray-700">❌ No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
            <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center space-x-2">
              <Stethoscope className="h-5 w-5" />
              <span>Medical Information</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                  <ClipboardList className="h-4 w-4" />
                  <span>Case History</span>
                </label>
                <textarea
                  name="history"
                  value={formData.history}
                  onChange={handleInputChange}
                  rows={3}
                  disabled={isLoading}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm disabled:bg-gray-100"
                  placeholder="Describe how the animal was found, circumstances, initial condition..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                  <Activity className="h-4 w-4" />
                  <span>Symptoms Observed</span>
                </label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleInputChange}
                  rows={2}
                  disabled={isLoading}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm disabled:bg-gray-100"
                  placeholder="List visible injuries, behavioral observations, physical symptoms..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>Initial Treatment</span>
                </label>
                <textarea
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleInputChange}
                  rows={4}
                  disabled={isLoading}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm disabled:bg-gray-100"
                  placeholder="Describe initial treatment given, medications administered, procedures performed..."
                />
              </div>
            </div>
          </div>

          {/* Treatment Schedule */}
          <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-indigo-900 flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Treatment Schedule</span>
                </h3>
                <p className="text-sm text-gray-600 mt-1">Plan and track treatment sessions for this case</p>
              </div>
              <Button
                type="button"
                onClick={addTreatmentDay}
                variant="secondary"
                className="flex items-center text-sm"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Treatment Day
              </Button>
            </div>

            {treatmentDays.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-white rounded-lg border-2 border-dashed">
                <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="font-medium">No treatment days scheduled</p>
                <p className="text-sm mt-1">Click "Add Treatment Day" to create a treatment schedule</p>
              </div>
            ) : (
              <div className="space-y-4">
                {treatmentDays.map((day, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900 flex items-center space-x-2">
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
                          {index + 1}
                        </div>
                        <span>Treatment Day {index + 1}</span>
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          onClick={() => removeTreatmentDay(index)}
                          variant="secondary"
                          className="text-red-600 hover:text-red-700 text-xs p-1"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={day.date}
                          onChange={(e) => handleTreatmentDayChange(index, 'date', e.target.value)}
                          disabled={isLoading}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Treatment Type
                        </label>
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                          <label className="flex items-center p-2 rounded border hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={day.dressing}
                              onChange={(e) => handleTreatmentDayChange(index, 'dressing', e.target.checked)}
                              disabled={isLoading}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">🩹 Dressing</span>
                          </label>

                          <label className="flex items-center p-2 rounded border hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={day.medication}
                              onChange={(e) => handleTreatmentDayChange(index, 'medication', e.target.checked)}
                              disabled={isLoading}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">💊 Medication</span>
                          </label>

                          <label className="flex items-center p-2 rounded border hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={day.injectable}
                              onChange={(e) => handleTreatmentDayChange(index, 'injectable', e.target.checked)}
                              disabled={isLoading}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">💉 Injectable</span>
                          </label>

                          <label className="flex items-center p-2 rounded border hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={day.surgery}
                              onChange={(e) => handleTreatmentDayChange(index, 'surgery', e.target.checked)}
                              disabled={isLoading}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">🏥 Surgery</span>
                          </label>
                        </div>
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Remarks
                        </label>
                        <input
                          type="text"
                          value={day.remark}
                          onChange={(e) => handleTreatmentDayChange(index, 'remark', e.target.value)}
                          disabled={isLoading}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                          placeholder="Add detailed notes about this treatment session..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Case paper will be saved with case number: <strong>{formData.caseNo}</strong></span>
                </div>
                <p className="mt-1">Please review all information before submitting.</p>
              </div>
              
              <div className="flex space-x-3">
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
                  disabled={!formData.informerName || !formData.animalType || !formData.location}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading 
                    ? `${isEditMode ? 'Updating' : 'Saving'} Case Paper...` 
                    : `${isEditMode ? 'Update' : 'Submit'} Case Paper`
                  }
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CasePaperForm;