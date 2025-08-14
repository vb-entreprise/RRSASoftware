import React, { useState, useEffect } from 'react';
import { Plus, Eye, Pencil, X, Trash2, Calendar, User, MapPin, Phone, Heart, Stethoscope, ClipboardList, Activity, Clock, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import CasePaperForm from '../components/casepaper/CasePaperForm';
import { casePapersService, CasePaper, TreatmentDay } from '../services/firebaseService';

const CasePaperPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingCasePaper, setEditingCasePaper] = useState<CasePaper | null>(null);
  const [viewingCasePaper, setViewingCasePaper] = useState<CasePaper | null>(null);
  const [deletingCasePaper, setDeletingCasePaper] = useState<CasePaper | null>(null);
  const [casePapers, setCasePapers] = useState<CasePaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCasePapers();
  }, []);

  const fetchCasePapers = async () => {
    try {
      setIsLoading(true);
      const fetchedCasePapers = await casePapersService.getAll();
      setCasePapers(fetchedCasePapers);
      setError(null);
    } catch (err) {
      setError('Failed to fetch case papers');
      console.error('Error fetching case papers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingCasePaper(null);
    fetchCasePapers();
  };

  const handleView = (casePaper: CasePaper) => {
    setViewingCasePaper(casePaper);
    setShowViewModal(true);
  };

  const handleEdit = (casePaper: CasePaper) => {
    setEditingCasePaper(casePaper);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingCasePaper?.id) return;

    setIsDeleting(true);
    try {
      await casePapersService.delete(deletingCasePaper.id);
      fetchCasePapers();
      setDeletingCasePaper(null);
    } catch (error) {
      console.error('Error deleting case paper:', error);
      setError('Failed to delete case paper. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const closeAllModals = () => {
    setShowForm(false);
    setShowViewModal(false);
    setEditingCasePaper(null);
    setViewingCasePaper(null);
    setDeletingCasePaper(null);
  };

  const CasePaperViewModal = ({ casePaper }: { casePaper: CasePaper }) => (
    <div className="max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-green-50 border-b border-gray-200 px-4 sm:px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg">
              <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Case Paper Details</h2>
              <p className="text-xs sm:text-sm text-gray-600">Case #{casePaper.case_number}</p>
            </div>
          </div>
          <button
            onClick={() => setShowViewModal(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="space-y-6 sm:space-y-8">
          {/* Basic Case Information */}
          <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border border-blue-200">
            <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3 sm:mb-4 flex items-center space-x-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Case Information</span>
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Date & Time</label>
                <p className="mt-1 text-xs sm:text-sm text-gray-900">{new Date(casePaper.date_time).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Case Number</label>
                <p className="mt-1 text-xs sm:text-sm text-gray-900 font-mono">{casePaper.case_number}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Rescue By</label>
                <p className="mt-1 text-xs sm:text-sm text-gray-900">{casePaper.rescue_by}</p>
              </div>
            </div>
          </div>

          {/* Informer Details */}
          <div className="bg-purple-50 p-4 sm:p-6 rounded-lg border border-purple-200">
            <h3 className="text-base sm:text-lg font-semibold text-purple-900 mb-3 sm:mb-4 flex items-center space-x-2">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Informer Details</span>
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-xs sm:text-sm text-gray-900">{casePaper.informer_name}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Aadhar Number</label>
                <p className="mt-1 text-xs sm:text-sm text-gray-900 font-mono">{casePaper.informer_aadhar}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Phone Number</label>
                <p className="mt-1 text-xs sm:text-sm text-gray-900">{casePaper.phone_no}</p>
              </div>
              {casePaper.alternate_phone && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Alternate Phone</label>
                  <p className="mt-1 text-xs sm:text-sm text-gray-900">{casePaper.alternate_phone}</p>
                </div>
              )}
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Location</label>
                <p className="mt-1 text-xs sm:text-sm text-gray-900">{casePaper.location}</p>
              </div>
            </div>
          </div>

          {/* Animal Details */}
          <div className="bg-green-50 p-4 sm:p-6 rounded-lg border border-green-200">
            <h3 className="text-base sm:text-lg font-semibold text-green-900 mb-3 sm:mb-4 flex items-center space-x-2">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Animal Details</span>
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Animal Type</label>
                <p className="mt-1 text-xs sm:text-sm text-gray-900 capitalize">{casePaper.animal_type}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Age</label>
                <p className="mt-1 text-xs sm:text-sm text-gray-900">{casePaper.age}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Sex</label>
                <p className="mt-1 text-xs sm:text-sm text-gray-900 capitalize">{casePaper.sex}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700">Admission Status</label>
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  casePaper.admitted 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {casePaper.admitted ? '✅ Admitted' : '❌ Not Admitted'}
                </span>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          {(casePaper.history || casePaper.symptoms || casePaper.treatment) && (
            <div className="bg-orange-50 p-4 sm:p-6 rounded-lg border border-orange-200">
              <h3 className="text-base sm:text-lg font-semibold text-orange-900 mb-3 sm:mb-4 flex items-center space-x-2">
                <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Medical Information</span>
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {casePaper.history && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 flex items-center space-x-1">
                      <ClipboardList className="h-4 w-4" />
                      <span>Case History</span>
                    </label>
                    <p className="text-xs sm:text-sm text-gray-900 whitespace-pre-wrap">{casePaper.history}</p>
                  </div>
                )}
                {casePaper.symptoms && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 flex items-center space-x-1">
                      <Activity className="h-4 w-4" />
                      <span>Symptoms Observed</span>
                    </label>
                    <p className="text-xs sm:text-sm text-gray-900 whitespace-pre-wrap">{casePaper.symptoms}</p>
                  </div>
                )}
                {casePaper.treatment && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>Initial Treatment</span>
                    </label>
                    <p className="text-xs sm:text-sm text-gray-900 whitespace-pre-wrap">{casePaper.treatment}</p>
                  </div>
                )}
              </div>
            </div>
                     )}

           {/* Treatment Schedule */}
           {casePaper.treatment_schedule && casePaper.treatment_schedule.length > 0 && (
            <div className="bg-indigo-50 p-4 sm:p-6 rounded-lg border border-indigo-200">
              <h3 className="text-base sm:text-lg font-semibold text-indigo-900 mb-3 sm:mb-4 flex items-center space-x-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                 <span>Treatment Schedule</span>
               </h3>
              <div className="space-y-3 sm:space-y-4">
                 {casePaper.treatment_schedule.map((day, index) => (
                  <div key={index} className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm sm:text-base font-medium text-gray-900 flex items-center space-x-2">
                        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
                           {index + 1}
                         </div>
                         <span>Day {index + 1}</span>
                       </h4>
                       {day.date && (
                        <span className="text-xs sm:text-sm text-gray-600">
                           {new Date(day.date).toLocaleString()}
                         </span>
                       )}
                     </div>

                    <div className="grid grid-cols-1 gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-2">
                       {day.dressing && (
                        <div className="flex items-center space-x-2 text-xs sm:text-sm">
                           <span className="text-green-600">✅</span>
                           <span>🩹 Dressing</span>
                         </div>
                       )}
                       {day.medication && (
                        <div className="flex items-center space-x-2 text-xs sm:text-sm">
                           <span className="text-green-600">✅</span>
                           <span>💊 Medication</span>
                         </div>
                       )}
                       {day.injectable && (
                        <div className="flex items-center space-x-2 text-xs sm:text-sm">
                           <span className="text-green-600">✅</span>
                           <span>💉 Injectable</span>
                         </div>
                       )}
                       {day.surgery && (
                        <div className="flex items-center space-x-2 text-xs sm:text-sm">
                           <span className="text-green-600">✅</span>
                           <span>🏥 Surgery</span>
                         </div>
                       )}
                     </div>

                     {day.remark && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs sm:text-sm">
                         <label className="block text-xs font-medium text-gray-700 mb-1">Remarks:</label>
                         <p className="text-gray-900">{day.remark}</p>
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             </div>
           )}
         </div>
       </div>
     </div>
   );

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
            <h1 className="text-2xl font-semibold text-gray-900">Case Papers</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all case papers including case number, informer details, and animal information.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button onClick={() => setShowForm(true)} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add New Case
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
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Informer Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Animal Type
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Location
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
                    {casePapers.map((paper) => (
                      <tr key={paper.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {paper.case_number}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(paper.date_time).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {paper.informer_name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                          {paper.animal_type}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {paper.location}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            paper.admitted 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {paper.admitted ? 'Admitted' : 'Not Admitted'}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button 
                            onClick={() => handleView(paper)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(paper)}
                            className="text-green-600 hover:text-green-900 mr-3"
                            title="Edit Case"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => setDeletingCasePaper(paper)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Case"
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

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-7xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCasePaper ? 'Edit Case Paper' : 'New Case Paper'}
              </h2>
              <button
                onClick={closeAllModals}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <CasePaperForm 
              onSubmit={handleFormSubmit} 
              onClose={closeAllModals}
              casePaper={editingCasePaper || undefined}
            />
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingCasePaper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
            <CasePaperViewModal casePaper={viewingCasePaper} />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCasePaper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Case Paper</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete case paper <strong>#{deletingCasePaper.case_number}</strong>?
              </p>
              <div className="mt-2 p-3 bg-gray-50 rounded border">
                <p className="text-xs text-gray-600">
                  <strong>Informer:</strong> {deletingCasePaper.informer_name}<br />
                  <strong>Animal:</strong> {deletingCasePaper.animal_type} ({deletingCasePaper.sex})<br />
                  <strong>Location:</strong> {deletingCasePaper.location}
                </p>
              </div>
            </div>

            <div className="flex space-x-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDeletingCasePaper(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleDelete}
                isLoading={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete Case Paper'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CasePaperPage;