import React, { useState, useEffect } from 'react';
import { Plus, Eye, Pencil, X } from 'lucide-react';
import Button from '../components/ui/Button';
import InwardForm from '../components/inventory/InwardForm';
import OutwardForm from '../components/inventory/OutwardForm';
import { inventoryRecordsService, InventoryRecord } from '../services/firebaseService';

const InventoryPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<InventoryRecord | null>(null);
  const [formType, setFormType] = useState<'inward' | 'outward'>('inward');
  const [records, setRecords] = useState<InventoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const fetchedRecords = await inventoryRecordsService.getAll();
      setRecords(fetchedRecords);
      setError(null);
    } catch (err) {
      setError('Failed to fetch inventory records');
      console.error('Error fetching inventory records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingRecord(null);
    fetchRecords();
  };

  const handleEdit = (record: InventoryRecord) => {
    setEditingRecord(record);
    setFormType(record.type);
    setShowForm(true);
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
            <h1 className="text-2xl font-semibold text-gray-900">Inventory Records</h1>
            <p className="mt-2 text-sm text-gray-700">
              Track inward and outward movement of inventory items.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
            <Button 
              onClick={() => {
                setFormType('inward');
                setShowForm(true);
              }} 
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Inward Record
            </Button>
            <Button 
              onClick={() => {
                setFormType('outward');
                setShowForm(true);
              }}
              variant="secondary" 
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Outward Record
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
                        Item Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Given By
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Received By
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Quantity
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Placed At
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Type
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Expected Return
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Actual Return
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {records.map((record) => (
                      <tr key={record.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                          {new Date(record.date_time).toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {record.item_name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {record.given_by}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {record.received_by}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {record.quantity}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {record.placed_at}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            record.type === 'inward'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.type}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {record.type === 'outward' && record.expected_return_date ? (
                            new Date(record.expected_return_date).toLocaleDateString()
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {record.type === 'outward' && record.actual_return_date ? (
                            <span className="text-green-600 font-medium">
                              {new Date(record.actual_return_date).toLocaleDateString()}
                            </span>
                          ) : record.type === 'outward' ? (
                            <span className="text-orange-600 font-medium">Pending</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button className="text-primary-600 hover:text-primary-900 mr-3">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(record)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Edit Record"
                          >
                            <Pencil className="h-4 w-4" />
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
                {editingRecord ? 'Edit' : 'New'} {formType === 'inward' ? 'Inward' : 'Outward'} Record
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {formType === 'inward' ? (
              <InwardForm 
                onSubmit={handleFormSubmit} 
                onClose={() => {
                  setShowForm(false);
                  setEditingRecord(null);
                }}
                inventoryRecord={editingRecord}
                isEditMode={!!editingRecord}
              />
            ) : (
              <OutwardForm 
                onSubmit={handleFormSubmit} 
                onClose={() => {
                  setShowForm(false);
                  setEditingRecord(null);
                }}
                inventoryRecord={editingRecord}
                isEditMode={!!editingRecord}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default InventoryPage;