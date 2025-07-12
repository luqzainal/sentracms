import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Package, Copy } from 'lucide-react';

interface AddComponentModalProps {
  onClose: () => void;
  onSave: (componentData: any) => void;
  clientId?: number;
  packageName?: string;
}

interface Component {
  id: string;
  name: string;
}

const AddComponentModal: React.FC<AddComponentModalProps> = ({ onClose, onSave, packageName }) => {
  const [components, setComponents] = useState<Component[]>([]);
  const [bulkText, setBulkText] = useState('');
  
  // Pre-populate with package name if provided
  useEffect(() => {
    if (packageName && components.length === 0) {
      setComponents([{
        id: Date.now().toString(),
        name: packageName
      }]);
    }
  }, [packageName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validComponents = components.filter(comp => comp.name.trim());
    if (validComponents.length === 0) {
      alert('Please add at least one component');
      return;
    }
    onSave(validComponents);
  };

  const addComponent = () => {
    setComponents([...components, { id: Date.now().toString(), name: '' }]);
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter(comp => comp.id !== id));
  };

  const updateComponent = (id: string, name: string) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, name } : comp
    ));
  };

  const handleProcessPaste = () => {
    if (!bulkText.trim()) return;
    
    // Split by new lines and filter out empty lines
    const lines = bulkText.split('\n').filter(line => line.trim());
    
    // Create new components from the pasted text exactly as typed
    const newComponents = lines.map(line => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: line.trim()
    }));
    
    // Replace existing components with the new ones from paste
    setComponents(newComponents);
    setBulkText(''); // Clear the textarea after processing
  };

  const clearAll = () => {
    setComponents([]);
    setBulkText('');
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-900">
              {packageName ? `Add Components for ${packageName}` : 'Add Components in Bulk'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Bulk Paste Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-slate-900">Bulk Add Components</h3>
              <button
                type="button"
                onClick={clearAll}
                className="text-red-600 hover:text-red-700 text-sm transition-colors"
              >
                Clear All
              </button>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Paste component names (one per line):
              </label>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Paste your component names here, one per line..."
                className="w-full h-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-slate-500">
                  <span className="text-blue-600">Tip:</span> Copy component names from your list and paste them here. Each line will become a separate component.
                </p>
                <button
                  type="button"
                  onClick={handleProcessPaste}
                  disabled={!bulkText.trim()}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Copy className="w-4 h-4" />
                  <span>Process Paste</span>
                </button>
              </div>
            </div>
          </div>

          {/* Individual Components Section */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">
                Components ({components.length})
              </h3>
              <button
                type="button"
                onClick={addComponent}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Individual</span>
              </button>
            </div>

            {components.length === 0 ? (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>No components added yet</p>
                <p className="text-sm">Use bulk paste above or add individual components</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {components.map((component, index) => (
                  <div key={component.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-700">Component {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeComponent(component.id)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Component Name *
                      </label>
                      <input
                        type="text"
                        value={component.name}
                        onChange={(e) => updateComponent(component.id, e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Enter component name"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={components.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add {components.length} Component{components.length !== 1 ? 's' : ''}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddComponentModal;