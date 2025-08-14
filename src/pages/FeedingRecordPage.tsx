import React, { useState, useEffect } from 'react';
import { Plus, Eye, Pencil, X, Trash2, AlertCircle, Utensils, Clock } from 'lucide-react';
import Button from '../components/ui/Button';
import FeedingRecordForm from '../components/feeding/FeedingRecordForm';
import { feedingRecordsService, FeedingRecord } from '../services/firebaseService';

const FeedingRecordPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FeedingRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<FeedingRecord | null>(null);
  const [records, setRecords] = useState<FeedingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const fetchedRecords = await feedingRecordsService.getAll();
      setRecords(fetchedRecords.sort((a, b) => 
        new Date(b.feeding_time).getTime() - new Date(a.feeding_time).getTime()
      ));
      setError(null);
    } catch (err) {
      console.error('Error fetching feeding records:', err);
      setError('Failed to fetch feeding records');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (recordId: string) => {
    try {
      await feedingRecordsService.delete(recordId);
      setShowDeleteConfirm(false);
      setSelectedRecord(null);
      await fetchRecords();
    } catch (err) {
      console.error('Error deleting feeding record:', err);
      setError('Failed to delete feeding record');
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingRecord(null);
    fetchRecords();
  };

  const renderViewModal = () => {
    if (!selectedRecord) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Feeding Record Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(selectedRecord.feeding_time).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => {
                setShowViewModal(false);
                setSelectedRecord(null);
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Basic Information</span>
                </h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">{new Date(selectedRecord.date).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Fed By</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedRecord.fed_by}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Animal ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedRecord.animal_id || 'Not specified'}</dd>
                  </div>
                </dl>
              </div>

              {/* Feeding Status */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-lg font-medium text-green-900 mb-4 flex items-center space-x-2">
                  <Utensils className="h-5 w-5" />
                  <span>Feeding Status</span>
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Morning Status</h4>
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      selectedRecord.morning_fed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedRecord.morning_fed ? 'Fed according to menu' : 'Not fed according to menu'}
                    </span>
                    {!selectedRecord.morning_fed && selectedRecord.morning_fed_note && (
                      <div className="mt-2">
                        <dt className="text-sm font-medium text-gray-500">What was fed</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedRecord.morning_fed_note}</dd>
                      </div>
                    )}
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Evening Status</h4>
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      selectedRecord.evening_fed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedRecord.evening_fed ? 'Fed according to menu' : 'Not fed according to menu'}
                    </span>
                    {!selectedRecord.evening_fed && selectedRecord.evening_fed_note && (
                      <div className="mt-2">
                        <dt className="text-sm font-medium text-gray-500">What was fed</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedRecord.evening_fed_note}</dd>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Food Details */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h3 className="text-lg font-medium text-orange-900 mb-4">Food Details</h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Food Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedRecord.food_type || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedRecord.quantity || 'Not specified'}</dd>
                  </div>
                </dl>
              </div>

              {/* Notes */}
              {selectedRecord.notes && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDeleteConfirmation = () => {
    if (!selectedRecord) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Delete Feeding Record
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete this feeding record? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedRecord(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => selectedRecord.id && handleDelete(selectedRecord.id)}
              >
                Delete Record
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
            <h1 className="text-2xl font-semibold text-gray-900">Feeding Records</h1>
            <p className="mt-2 text-sm text-gray-700">
              Track daily feeding activities and ensure animals are fed according to schedule.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button onClick={() => setShowForm(true)} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Feeding Record
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
                        Fed By
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Animal ID
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
                    {records.map((record) => {
                      const feedingTime = new Date(record.feeding_time);
                      const isMorning = feedingTime.getHours() < 12;

                      return (
                        <tr key={record.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <div className="font-medium text-gray-900">
                              {feedingTime.toLocaleDateString()}
                            </div>
                            <div className="text-gray-500">
                              {feedingTime.toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {record.fed_by}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {record.animal_id || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <div className="flex flex-col space-y-1">
                              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                isMorning
                                  ? record.morning_fed
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                  : record.evening_fed
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {isMorning
                                  ? record.morning_fed ? 'Morning - Fed' : 'Morning - Not Fed'
                                  : record.evening_fed ? 'Evening - Fed' : 'Evening - Not Fed'
                                }
                              </span>
                            </div>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button 
                              onClick={() => {
                                setSelectedRecord(record);
                                setShowViewModal(true);
                              }}
                              className="text-primary-600 hover:text-primary-900 mr-3"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setEditingRecord(record);
                                setShowForm(true);
                              }}
                              className="text-primary-600 hover:text-primary-900 mr-3"
                              title="Edit Record"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedRecord(record);
                                setShowDeleteConfirm(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Record"
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
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingRecord ? 'Edit Feeding Record' : 'New Feeding Record'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingRecord(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FeedingRecordForm 
              onSubmit={handleFormSubmit} 
              onClose={() => {
                setShowForm(false);
                setEditingRecord(null);
              }}
              editingRecord={editingRecord}
            />
          </div>
        </div>
      )}

      {showViewModal && renderViewModal()}
      {showDeleteConfirm && renderDeleteConfirmation()}
    </>
  );
};

export default FeedingRecordPage;