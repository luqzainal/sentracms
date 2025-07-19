import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Clock, Package, User, Calendar, Menu, X } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import { useToast } from '../../hooks/useToast';

interface ClientRequestsPageProps {
  onToggleSidebar?: () => void;
}

const ClientRequestsPage: React.FC<ClientRequestsPageProps> = ({ onToggleSidebar }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const { 
    clientServiceRequests,
    loading,
    fetchClientServiceRequests,
    updateClientServiceRequest
  } = useAppStore();
  const { success, error } = useToast();

  useEffect(() => {
    fetchClientServiceRequests();
  }, [fetchClientServiceRequests]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredRequests = clientServiceRequests.filter(request => {
    const matchesSearch = 
      request.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.service?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || '');
    setRejectionReason(request.rejection_reason || '');
    setShowRequestModal(true);
  };

  const handleUpdateStatus = async (requestId: number, status: string) => {
    try {
      const updates: any = { status };
      
      if (status === 'Approved') {
        updates.approved_date = new Date().toISOString();
      } else if (status === 'Rejected') {
        updates.rejected_date = new Date().toISOString();
      } else if (status === 'Completed') {
        updates.completed_date = new Date().toISOString();
      }

      if (adminNotes.trim()) {
        updates.admin_notes = adminNotes.trim();
      }

      if (rejectionReason.trim() && status === 'Rejected') {
        updates.rejection_reason = rejectionReason.trim();
      }

      await updateClientServiceRequest(requestId, updates);
      success('Status Updated', 'Request status has been updated successfully');
      setShowRequestModal(false);
      fetchClientServiceRequests();
    } catch (err) {
      console.error('Error updating request status:', err);
      error('Update Failed', 'Failed to update request status. Please try again.');
    }
  };

  const pendingRequests = clientServiceRequests.filter(r => r.status === 'Pending').length;
  const approvedRequests = clientServiceRequests.filter(r => r.status === 'Approved').length;
  const rejectedRequests = clientServiceRequests.filter(r => r.status === 'Rejected').length;
  const completedRequests = clientServiceRequests.filter(r => r.status === 'Completed').length;

  if (loading.clientServiceRequests) {
    return (
      <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading client requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Client Service Requests</h1>
            <p className="text-slate-600">Manage client requests for add-on services</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 lg:p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-700 font-semibold text-xs lg:text-sm uppercase tracking-wide">Pending</p>
              <p className="text-xl lg:text-2xl font-bold text-yellow-900 mt-1">{pendingRequests}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 lg:p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 font-semibold text-xs lg:text-sm uppercase tracking-wide">Approved</p>
              <p className="text-xl lg:text-2xl font-bold text-green-900 mt-1">{approvedRequests}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 lg:p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 font-semibold text-xs lg:text-sm uppercase tracking-wide">Rejected</p>
              <p className="text-xl lg:text-2xl font-bold text-red-900 mt-1">{rejectedRequests}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 lg:p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 font-semibold text-xs lg:text-sm uppercase tracking-wide">Completed</p>
              <p className="text-xl lg:text-2xl font-bold text-blue-900 mt-1">{completedRequests}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 flex-1">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by client name or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-2 lg:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-sm lg:text-base"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 lg:px-4 py-2 lg:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-w-[120px] lg:min-w-[150px] transition-all duration-200 text-sm lg:text-base"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 lg:py-4 px-3 lg:px-6 font-semibold text-slate-900 text-xs lg:text-sm">Client</th>
                <th className="text-left py-3 lg:py-4 px-3 lg:px-6 font-semibold text-slate-900 text-xs lg:text-sm">Service</th>
                <th className="text-left py-3 lg:py-4 px-3 lg:px-6 font-semibold text-slate-900 text-xs lg:text-sm">Request Date</th>
                <th className="text-left py-3 lg:py-4 px-3 lg:px-6 font-semibold text-slate-900 text-xs lg:text-sm">Status</th>
                <th className="text-center py-3 lg:py-4 px-3 lg:px-6 font-semibold text-slate-900 text-xs lg:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50 transition-colors duration-150">
                  <td className="py-3 lg:py-4 px-3 lg:px-6">
                    <div>
                      <h4 className="font-medium text-slate-900 text-sm lg:text-base">{request.client?.name || 'Unknown Client'}</h4>
                      <p className="text-xs lg:text-sm text-slate-600">{request.client?.email || 'No email'}</p>
                    </div>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-6">
                    <div>
                      <h4 className="font-medium text-slate-900 text-sm lg:text-base">{request.service?.name || 'Unknown Service'}</h4>
                      <p className="text-xs lg:text-sm text-slate-600">RM {request.service?.price?.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
                    </div>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-6">
                    <span className="text-sm text-slate-600">
                      {new Date(request.request_date).toLocaleDateString('en-MY')}
                    </span>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-6">
                    <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 w-fit ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span>{request.status}</span>
                    </span>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-6 text-center">
                    <button 
                      onClick={() => handleViewRequest(request)}
                      className="p-1.5 lg:p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    >
                      <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No requests found</h3>
          <p className="text-slate-600 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'No client service requests yet'
            }
          </p>
        </div>
      )}

      {/* Request Details Modal */}
      {showRequestModal && selectedRequest && (
        <div className="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
                  <p className="text-sm text-gray-600">Review and manage client request</p>
                </div>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Client Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Client Information</span>
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{selectedRequest.client?.name || 'Unknown Client'}</p>
                  <p className="text-gray-600">{selectedRequest.client?.email || 'No email'}</p>
                </div>
              </div>

              {/* Service Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span>Service Requested</span>
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{selectedRequest.service?.name || 'Unknown Service'}</p>
                  <p className="text-gray-600">{selectedRequest.service?.description || 'No description'}</p>
                  <p className="text-lg font-bold text-gray-900 mt-2">
                    RM {selectedRequest.service?.price?.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
              </div>

              {/* Request Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Request Information</span>
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Request Date:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(selectedRequest.request_date).toLocaleDateString('en-MY')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  placeholder="Add notes about this request..."
                />
              </div>

              {/* Rejection Reason (only show if status is Rejected) */}
              {selectedRequest.status === 'Rejected' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Reason for rejection..."
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                
                {selectedRequest.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'Approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'Rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
                
                {selectedRequest.status === 'Approved' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'Completed')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark Complete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientRequestsPage; 