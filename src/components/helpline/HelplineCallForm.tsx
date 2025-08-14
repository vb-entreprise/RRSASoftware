import React, { useState } from 'react';
import { Phone, User, MapPin, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { helplineCallsService, HelplineCall } from '../../services/firebaseService';
import timeZoneService from '../../services/timeZoneService';

interface HelplineCallFormProps {
  onSubmit: () => void;
  onClose: () => void;
  editingCall?: HelplineCall | null;
}

const PURPOSE_OPTIONS = [
  'rescue/ treatment',
  'volunteering', 
  'donation',
  'shelter visit',
  'adoption inquiry',
  'general query',
  'interview',
  'supplies',
  'other'
];

const HelplineCallForm: React.FC<HelplineCallFormProps> = ({ onSubmit, onClose, editingCall }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    dateTime: editingCall ? editingCall.date_time : timeZoneService.getCurrentDateTimeForInput(),
    contactNumber: editingCall ? editingCall.contact_number : '',
    callType: editingCall ? editingCall.call_type : 'received' as 'made' | 'received',
    callerName: editingCall ? editingCall.caller_name : '',
    callerAddress: editingCall ? editingCall.caller_address : '',
    purpose: editingCall ? editingCall.purpose : '',
    otherPurpose: editingCall ? editingCall.other_purpose || '' : '',
    queryClosed: editingCall ? editingCall.query_closed : false,
    notes: editingCall ? editingCall.notes || '' : ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dateTime || !formData.contactNumber || !formData.callerName || !formData.purpose) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.purpose === 'other' && !formData.otherPurpose.trim()) {
      setError('Please specify the purpose when selecting "other"');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const callData = {
        date_time: formData.dateTime,
        contact_number: formData.contactNumber,
        call_type: formData.callType,
        caller_name: formData.callerName,
        caller_address: formData.callerAddress,
        purpose: formData.purpose === 'other' ? formData.otherPurpose : formData.purpose,
        other_purpose: formData.purpose === 'other' ? formData.otherPurpose : undefined,
        query_closed: formData.queryClosed,
        notes: formData.notes
      };

      if (editingCall && editingCall.id) {
        await helplineCallsService.update(editingCall.id, callData);
      } else {
        await helplineCallsService.create(callData);
      }
      
      onSubmit();
    } catch (error) {
      console.error('Error saving helpline call:', error);
      setError('Failed to save helpline call. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 px-6 py-4 z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Helpline Call Record</h2>
            <p className="text-sm text-gray-600">Record and track helpline calls for better communication management</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Call Information */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Call Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="dateTime"
                  value={formData.dateTime}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter contact number"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call Made/Received *
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="callType"
                      value="received"
                      checked={formData.callType === 'received'}
                      onChange={handleInputChange}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Received</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="callType"
                      value="made"
                      checked={formData.callType === 'made'}
                      onChange={handleInputChange}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Made</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Caller Information */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Caller Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name of Caller *
                </label>
                <input
                  type="text"
                  name="callerName"
                  value={formData.callerName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter caller's name"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address of Caller
                </label>
                <textarea
                  name="callerAddress"
                  value={formData.callerAddress}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Enter caller's address"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm bg-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* Call Purpose */}
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Call Purpose</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Called for (Purpose) *
                </label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm bg-white"
                >
                  <option value="">Select purpose</option>
                  {PURPOSE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {formData.purpose === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specify Purpose *
                  </label>
                  <input
                    type="text"
                    name="otherPurpose"
                    value={formData.otherPurpose}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter the specific purpose"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm bg-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Query Status */}
          <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
            <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Query Status</span>
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-2 p-2 hover:bg-white rounded-md cursor-pointer">
                <input
                  type="checkbox"
                  name="queryClosed"
                  checked={formData.queryClosed}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Query closed</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Additional Notes</span>
            </h3>
            
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              placeholder="Add any additional notes about the call..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm bg-white resize-none"
            />
          </div>

          {/* Submit Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Helpline call record will be saved to the database</span>
                </div>
                <p className="mt-1">This record helps track communication and follow up on queries.</p>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isLoading}
                  onClick={onClose}
                  className="flex items-center"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  className="flex items-center bg-blue-600 hover:bg-blue-700"
                  disabled={!formData.dateTime || !formData.contactNumber || !formData.callerName || !formData.purpose || (formData.purpose === 'other' && !formData.otherPurpose.trim())}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {isLoading 
                    ? (editingCall ? 'Updating Call Record...' : 'Saving Call Record...') 
                    : (editingCall ? 'Update Call Record' : 'Save Call Record')
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

export default HelplineCallForm;
