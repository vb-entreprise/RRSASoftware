import React, { useState, useEffect } from 'react';
import { Plus, Eye, Pencil, X, Trash2, Image, Calendar, User, Link, Search, Filter, Shield } from 'lucide-react';
import Button from '../components/ui/Button';
import MediaForm from '../components/media/MediaForm';
import { MediaRecord, mediaRecordsService } from '../services/firebaseService';
import { useAuth } from '../context/AuthContext';

const MediaPage: React.FC = () => {
  const { user, hasModuleAccess } = useAuth();
  const [showMediaForm, setShowMediaForm] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaRecord | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaRecord | null>(null);
  const [mediaRecords, setMediaRecords] = useState<MediaRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  // Check if user has access to Media Library - moved after hooks
  if (!hasModuleAccess('Media Library')) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <Shield className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Access Restricted</h3>
          <p className="mt-2 text-sm text-gray-500">
            You don't have permission to access Media Library.
          </p>
          <div className="mt-4 text-xs text-gray-400">
            Current role: <span className="font-medium capitalize">{user?.role}</span>
          </div>
        </div>
      </div>
    );
  }

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const fetchedRecords = await mediaRecordsService.getAll();
      setMediaRecords(fetchedRecords);
      setError(null);
    } catch (err) {
      console.error('Error fetching media records:', err);
      setError('Failed to fetch media records');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = () => {
    setShowMediaForm(false);
    setEditingMedia(null);
    fetchRecords();
  };

  const handleEdit = (record: MediaRecord) => {
    setEditingMedia(record);
    setShowMediaForm(true);
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
            <h1 className="text-2xl font-semibold text-gray-900">Media Records</h1>
            <p className="mt-2 text-sm text-gray-700">
              Track media records for rescue, treatment, feeding, playing, and release activities.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button onClick={() => setShowMediaForm(true)} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Media Record
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
                        Case Number
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Type
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Date & Time
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        By Whom
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Drive Link
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {mediaRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {record.case_id}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            record.type === 'video' ? 'bg-red-100 text-red-800' :
                            record.type === 'image' ? 'bg-blue-100 text-blue-800' :
                            record.type === 'audio' ? 'bg-green-100 text-green-800' :
                            record.type === 'document' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {record.type}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(record.date_time).toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {record.uploaded_by}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {record.drive_link ? (
                            <a 
                              href={record.drive_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-900"
                            >
                              View Media
                            </a>
                          ) : (
                            'No link'
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

      {showMediaForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-7xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingMedia ? 'Edit Media Record' : 'New Media Record'}
              </h2>
              <button
                onClick={() => setShowMediaForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <MediaForm 
              onSubmit={handleFormSubmit} 
              onClose={() => {
                setShowMediaForm(false);
                setEditingMedia(null);
              }}
              mediaRecord={editingMedia}
              isEditMode={!!editingMedia}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MediaPage;