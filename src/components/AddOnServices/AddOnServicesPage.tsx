import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/AppStore';
import { AddOnService } from '../../types/database';
import { Plus, Edit, Trash2, Package, Search, Filter, Menu, Eye } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import ConfirmationModal from '../common/ConfirmationModal';
import { useConfirmation } from '../../hooks/useConfirmation';
import ServiceModal from './ServiceModal';

interface AddOnServicesPageProps {
  onToggleSidebar?: () => void;
}

const AddOnServicesPage: React.FC<AddOnServicesPageProps> = ({ onToggleSidebar }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<AddOnService | null>(null);

  const { 
    addOnServices, 
    clientServiceRequests,
    loading,
    fetchAddOnServices,
    fetchClientServiceRequests,
    addAddOnService,
    updateAddOnService,
    deleteAddOnService
  } = useAppStore();
  const { success, error } = useToast();

  // Custom confirmation modal
  const { confirmation, showConfirmation, hideConfirmation, handleConfirm } = useConfirmation();

  useEffect(() => {
    fetchAddOnServices();
    fetchClientServiceRequests();
  }, [fetchAddOnServices, fetchClientServiceRequests]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Support':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'New Service':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredServices = addOnServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddService = () => {
    setSelectedService(null);
    setShowServiceModal(true);
  };

  const handleEditService = (service: AddOnService) => {
    setSelectedService(service);
    setShowServiceModal(true);
  };

  const handleDeleteService = async (serviceId: number) => {
    showConfirmation(
      async () => {
        try {
          await deleteAddOnService(serviceId);
          success('Service Deleted', 'Service has been deleted successfully');
          // Refresh data
          fetchAddOnServices();
        } catch (err) {
          console.error('Error deleting service:', err);
          error('Delete Failed', 'Failed to delete service. Please try again.');
        }
      },
      {
        title: 'Delete Service',
        message: 'Are you sure you want to delete this service?',
        confirmText: 'Delete',
        type: 'danger'
      }
    );
  };

  const handleSaveService = async (serviceData: Omit<AddOnService, 'id' | 'created_at'>) => {
    try {
      if (selectedService) {
        await updateAddOnService(selectedService.id, serviceData);
        success('Service Updated', 'Service has been updated successfully');
      } else {
        await addAddOnService(serviceData);
        success('Service Created', 'Service has been created successfully');
      }
      setShowServiceModal(false);
      // Refresh data
      fetchAddOnServices();
    } catch (err) {
      console.error('Error saving service:', err);
      error('Save Failed', 'Failed to save service. Please try again.');
    }
  };

  const handleViewRequests = () => {
    window.location.href = '/client-requests';
  };

  const categoryStats = {
    'Support': addOnServices.filter(s => s.category === 'Support').length,
    'New Service': addOnServices.filter(s => s.category === 'New Service').length
  };

  const totalServices = addOnServices.length;
  const availableServices = addOnServices.filter(s => s.status === 'Available').length;
  const pendingRequests = clientServiceRequests.filter(r => r.status === 'Pending').length;

  if (loading.addOnServices) {
    return (
      <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading add-on services...</p>
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
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Add-On Services</h1>
            <p className="text-slate-600">Manage additional services for clients</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleViewRequests}
            className="bg-orange-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl flex items-center space-x-2 hover:bg-orange-700 transition-all duration-200 font-medium shadow-sm text-sm lg:text-base"
          >
            <Eye className="w-5 h-5" />
            <span>View Requests ({pendingRequests})</span>
          </button>
          <button
            onClick={handleAddService}
            className="bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm text-sm lg:text-base"
          >
            <Plus className="w-5 h-5" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 lg:p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 font-semibold text-xs lg:text-sm uppercase tracking-wide">Total Services</p>
              <p className="text-xl lg:text-2xl font-bold text-blue-900 mt-1">{totalServices}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 lg:p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 font-semibold text-xs lg:text-sm uppercase tracking-wide">Available</p>
              <p className="text-xl lg:text-2xl font-bold text-green-900 mt-1">{availableServices}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 lg:p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-700 font-semibold text-xs lg:text-sm uppercase tracking-wide">Pending Requests</p>
              <p className="text-xl lg:text-2xl font-bold text-orange-900 mt-1">{pendingRequests}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 lg:p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 font-semibold text-xs lg:text-sm uppercase tracking-wide">Categories</p>
              <p className="text-xl lg:text-2xl font-bold text-purple-900 mt-1">{Object.keys(categoryStats).length}</p>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Filter className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 lg:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-sm lg:text-base"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 lg:px-4 py-2 lg:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-w-[120px] lg:min-w-[150px] transition-all duration-200 text-sm lg:text-base"
          >
            <option value="all">All Categories</option>
            <option value="Support">Support</option>
            <option value="New Service">New Service</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 lg:px-4 py-2 lg:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-w-[120px] lg:min-w-[150px] transition-all duration-200 text-sm lg:text-base"
          >
            <option value="all">All Status</option>
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 lg:py-4 px-3 lg:px-6 font-semibold text-slate-900 text-xs lg:text-sm">Service</th>
                <th className="text-left py-3 lg:py-4 px-3 lg:px-6 font-semibold text-slate-900 text-xs lg:text-sm">Category</th>
                <th className="text-left py-3 lg:py-4 px-3 lg:px-6 font-semibold text-slate-900 text-xs lg:text-sm">Price</th>
                <th className="text-left py-3 lg:py-4 px-3 lg:px-6 font-semibold text-slate-900 text-xs lg:text-sm">Status</th>
                <th className="text-center py-3 lg:py-4 px-3 lg:px-6 font-semibold text-slate-900 text-xs lg:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50 transition-colors duration-150">
                  <td className="py-3 lg:py-4 px-3 lg:px-6">
                    <div>
                      <h4 className="font-medium text-slate-900 text-sm lg:text-base">{service.name}</h4>
                      <p className="text-xs lg:text-sm text-slate-600 truncate max-w-[300px]">{service.description}</p>
                    </div>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-6">
                    <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(service.category)}`}>
                      {service.category}
                    </span>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-6">
                    <span className="font-medium text-slate-900">RM {service.price.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-6">
                    <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-6 text-center">
                    <div className="flex flex-col lg:flex-row items-center justify-center space-y-1 lg:space-y-0 lg:space-x-2">
                      <button 
                        onClick={() => handleEditService(service)}
                        className="p-1.5 lg:p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      >
                        <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteService(service.id)}
                        className="p-1.5 lg:p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No services found</h3>
          <p className="text-slate-600 mb-4">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first add-on service'
            }
          </p>
          {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
            <button
              onClick={handleAddService}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Service
            </button>
          )}
        </div>
      )}

      {/* Service Modal */}
      <ServiceModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        service={selectedService}
        onSave={handleSaveService}
      />

      {/* Custom Confirmation Modal */}
      {confirmation && (
        <ConfirmationModal
          isOpen={confirmation.isOpen}
          onClose={hideConfirmation}
          onConfirm={handleConfirm}
          title={confirmation.title || 'Confirm Action'}
          message={confirmation.message}
          confirmText={confirmation.confirmText}
          cancelText={confirmation.cancelText}
          type={confirmation.type}
          icon={confirmation.icon}
        />
      )}
    </div>
  );
};

export default AddOnServicesPage; 