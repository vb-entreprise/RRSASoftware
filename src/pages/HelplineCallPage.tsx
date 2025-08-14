import React, { useState, useEffect } from 'react';
import { Plus, Eye, Pencil, X, Trash2, AlertCircle, Phone, Clock, User, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import HelplineCallForm from '../components/helpline/HelplineCallForm';
import { helplineCallsService, HelplineCall } from '../services/firebaseService';

const HelplineCallPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingCall, setEditingCall] = useState<HelplineCall | null>(null);
  const [selectedCall, setSelectedCall] = useState<HelplineCall | null>(null);
  const [calls, setCalls] = useState<HelplineCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      setIsLoading(true);
      const fetchedCalls = await helplineCallsService.getAll();
      setCalls(fetchedCalls.sort((a, b) => 
        new Date(b.date_time).getTime() - new Date(a.date_time).getTime()
      ));
      setError(null);
    } catch (err) {
      console.error('Error fetching helpline calls:', err);
      setError('Failed to fetch helpline calls');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (callId: string) => {
    try {
      await helplineCallsService.delete(callId);
      setShowDeleteConfirm(false);
      setSelectedCall(null);
      await fetchCalls();
    } catch (err) {
      console.error('Error deleting helpline call:', err);
      setError('Failed to delete helpline call');
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingCall(null);
    fetchCalls();
  };

  const renderViewModal = () => {
    if (!selectedCall) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Helpline Call Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(selectedCall.date_time).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => {
                setShowViewModal(false);
                setSelectedCall(null);
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {/* Call Information */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Call Information</span>
                </h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
                    <dd className="mt-1 text-sm text-gray-900">{new Date(selectedCall.date_time).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contact Number</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedCall.contact_number}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Call Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">{selectedCall.call_type}</dd>
                  </div>
                </dl>
              </div>

              {/* Caller Information */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-lg font-medium text-green-900 mb-4 flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Caller Information</span>
                </h3>
                <dl className="grid grid-cols-1 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedCall.caller_name}</dd>
                  </div>
                  {selectedCall.caller_address && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Address</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedCall.caller_address}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Call Purpose */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="text-lg font-medium text-purple-900 mb-4 flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Call Purpose</span>
                </h3>
                <dl className="grid grid-cols-1 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Purpose</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">{selectedCall.purpose}</dd>
                  </div>
                  {selectedCall.other_purpose && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Other Purpose</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedCall.other_purpose}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Query Status */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h3 className="text-lg font-medium text-orange-900 mb-4 flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Query Status</span>
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    selectedCall.query_closed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedCall.query_closed ? 'Query Closed' : 'Query Open'}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedCall.notes && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedCall.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDeleteConfirmation = () => {
    if (!selectedCall) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Delete Helpline Call
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete this helpline call record? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedCall(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => selectedCall.id && handleDelete(selectedCall.id)}
              >
                Delete Call
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
            <h1 className="text-2xl font-semibold text-gray-900">Helpline Call Records</h1>
            <p className="mt-2 text-sm text-gray-700">
              Track and manage helpline calls for better communication and follow-up.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button onClick={() => setShowForm(true)} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Call Record
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
                        Date & Time
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Contact Number
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Caller Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Purpose
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
                    {calls.map((call) => (
                      <tr key={call.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="font-medium text-gray-900">
                            {new Date(call.date_time).toLocaleDateString()}
                          </div>
                          <div className="text-gray-500">
                            {new Date(call.date_time).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {call.contact_number}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {call.caller_name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className="capitalize">{call.purpose}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            call.query_closed
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {call.query_closed ? 'Closed' : 'Open'}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button 
                            onClick={() => {
                              setSelectedCall(call);
                              setShowViewModal(true);
                            }}
                            className="text-primary-600 hover:text-primary-900 mr-3"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setEditingCall(call);
                              setShowForm(true);
                            }}
                            className="text-primary-600 hover:text-primary-900 mr-3"
                            title="Edit Call"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedCall(call);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Call"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCall ? 'Edit Helpline Call' : 'New Helpline Call'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingCall(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <HelplineCallForm 
              onSubmit={handleFormSubmit} 
              onClose={() => {
                setShowForm(false);
                setEditingCall(null);
              }}
              editingCall={editingCall}
            />
          </div>
        </div>
      )}

      {showViewModal && renderViewModal()}
      {showDeleteConfirm && renderDeleteConfirmation()}
    </>
  );
};

export default HelplineCallPage;
