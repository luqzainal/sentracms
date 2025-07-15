import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Check, Edit, Trash2, Calendar, Clock, User, MessageCircle, Star, X, Upload, Link, FileText, Trash } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import { useSupabase } from '../../hooks/useSupabase';
import FileUpload from '../common/FileUpload';

interface ClientProgressTrackerProps {
  clientId: string;
  onBack: () => void;
}

interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  completed: boolean;
  completedDate?: string;
  important: boolean;
  comments: any[]; 
}

interface ProgressStepWithHierarchy extends ProgressStep {
  isPackage?: boolean;
  packageName?: string;
  children?: ProgressStepWithHierarchy[];
}

interface AttachedFile {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
}

const ClientProgressTracker: React.FC<ClientProgressTrackerProps> = ({ clientId, onBack }) => {
  const { user } = useSupabase();
  const [showAddStep, setShowAddStep] = useState(false);
  const [showEditStep, setShowEditStep] = useState(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentingStepId, setCommentingStepId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string; type: string; }[]>([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completingStepId, setCompletingStepId] = useState<string | null>(null);
  const [completionDate, setCompletionDate] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  
  const [newStep, setNewStep] = useState({
    title: '',
    description: '',
    deadline: '',
    important: false
  });

  const [editStep, setEditStep] = useState({
    title: '',
    description: '',
    deadline: '',
    important: false
  });

  const { 
    getClientById, 
    getProgressStepsByClientId,
    getInvoicesByClientId,
    addProgressStep,
    updateProgressStep,
    deleteProgressStep,
    copyComponentsToProgressSteps,
    fetchClientLinks,
    addClientLink,
    deleteClientLink,
    getClientLinksByClientId,
    addCommentToStep,
    deleteCommentFromStep
  } = useAppStore();

  const client = getClientById(parseInt(clientId));
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  const websiteLinks = getClientLinksByClientId(parseInt(clientId));

  const progressSteps = getProgressStepsByClientId(parseInt(clientId));
  const clientInvoices = getInvoicesByClientId(parseInt(clientId));

  // Create hierarchical structure for progress steps
  const createHierarchicalSteps = (): ProgressStepWithHierarchy[] => {
    const hierarchicalSteps: ProgressStepWithHierarchy[] = [];
    
    // Group steps by package
    clientInvoices.forEach(invoice => {
      // Find package step
      const packageStep = progressSteps.find(step => 
        step.title === `${invoice.packageName} - Package Setup`
      );
      
      if (packageStep) {
        // Find component steps for this package
        const componentSteps = progressSteps.filter(step => 
          step.title !== `${invoice.packageName} - Package Setup` &&
          !step.title.includes(' - Package Setup') // Exclude other package steps
        );
        
        const packageWithChildren: ProgressStepWithHierarchy = {
          ...packageStep,
          isPackage: true,
          packageName: invoice.packageName,
          children: componentSteps.map(step => ({
            ...step,
            isPackage: false,
            packageName: invoice.packageName
          }))
        };
        
        hierarchicalSteps.push(packageWithChildren);
      }
    });
    
    // Add any standalone steps (manually added steps that don't belong to a package)
    const standaloneSteps = progressSteps.filter(step => 
      !step.title.includes(' - Package Setup') && // Not a package step
      !clientInvoices.some(invoice => 
        progressSteps.some(ps => 
          ps.title === `${invoice.packageName} - Package Setup`
        )
      ) // Not part of any package's components
    );
    
    standaloneSteps.forEach(step => {
      hierarchicalSteps.push({
        ...step,
        isPackage: false
      });
    });
    
    return hierarchicalSteps;
  };

  const hierarchicalSteps = createHierarchicalSteps();

  // Fetch links when component loads
  useEffect(() => {
    if (client) {
      fetchClientLinks(client.id);
    }
  }, [client, fetchClientLinks]);

  if (!client) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900">Client not found</h2>
          <button onClick={onBack} className="mt-4 text-blue-600 hover:text-blue-700">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const handleToggleComplete = (stepId: string) => {
    const step = progressSteps.find(s => s.id === stepId);
    if (!step) return;

    if (!step.completed) {
      // Show completion modal to select date
      setCompletingStepId(stepId);
      setCompletionDate(new Date().toISOString().split('T')[0]);
      setShowCompletionModal(true);
    } else {
      // Uncomplete the step
      updateProgressStep(stepId, { completed: false, completedDate: undefined });
    }
  };

  const handleCompleteStep = () => {
    if (!completingStepId || !completionDate) return;

    updateProgressStep(completingStepId, { completed: true, completedDate: completionDate });

    setShowCompletionModal(false);
    setCompletingStepId(null);
    setCompletionDate('');
  };

  const handleAddStep = () => {
    if (!newStep.title.trim() || !newStep.deadline) return;
    
    addProgressStep({
      clientId: parseInt(clientId),
      title: newStep.title,
      description: newStep.description,
      deadline: newStep.deadline,
      completed: false,
      important: newStep.important,
      comments: []
    });
    
    setNewStep({ title: '', description: '', deadline: '', important: false });
    setShowAddStep(false);
  };

  const handleEditStepOpen = (step: any) => {
    setEditingStepId(step.id);
    setEditStep({
      title: step.title,
      description: step.description,
      deadline: step.deadline,
      important: step.important
    });
    setShowEditStep(true);
  };

  const handleEditStepSave = () => {
    if (!editStep.title.trim() || !editStep.deadline || !editingStepId) return;
    
    updateProgressStep(editingStepId, {
      title: editStep.title,
      description: editStep.description,
      deadline: editStep.deadline,
      important: editStep.important
    });
    
    setShowEditStep(false);
    setEditingStepId(null);
    setEditStep({ title: '', description: '', deadline: '', important: false });
  };

  const handleDeleteStep = (stepId: string) => {
    if (confirm('Are you sure you want to delete this step?')) {
      deleteProgressStep(stepId);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() && uploadedFiles.length === 0) {
      alert("Please add a comment or select a file.");
      return;
    }
    if (!commentingStepId) return;

    // Handle file attachments
    for (const file of uploadedFiles) {
      await addCommentToStep(commentingStepId, {
        text: newComment || `Attachment: ${file.name}`,
        username: user?.name || 'Admin',
        attachment_url: file.url,
        attachment_type: file.type,
      });
    }

    // Handle text-only comment
    if (newComment.trim() && uploadedFiles.length === 0) {
      await addCommentToStep(commentingStepId, {
        text: newComment,
        username: user?.name || 'Admin',
      });
    }

    // Reset state
    setNewComment('');
    setUploadedFiles([]);
    setShowCommentModal(false);
    setCommentingStepId(null);
  };

  const handleDeleteComment = async (stepId: string, commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteCommentFromStep(stepId, commentId);
      } catch (error) {
        console.error("Failed to delete comment:", error);
        // Optionally show a toast for the error
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const newFile: AttachedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date().toISOString()
      };
      setAttachedFiles(prev => [...prev, newFile]);
    });

    setShowFileUpload(false);
  };

  const handleDeleteFile = (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      setAttachedFiles(files => files.filter(f => f.id !== fileId));
    }
  };

  const handleAddLink = async () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim() || !client) return;

    let correctedUrl = newLinkUrl.trim();
    if (!correctedUrl.startsWith('http://') && !correctedUrl.startsWith('https://')) {
      correctedUrl = 'https://' + correctedUrl;
    }

    try {
      await addClientLink({
        client_id: client.id,
        title: newLinkTitle,
        url: correctedUrl,
      });
      setNewLinkTitle('');
      setNewLinkUrl('');
      setShowAddLink(false);
    } catch (error) {
      console.error("Failed to add link:", error);
      // You can add a toast notification here to inform the user
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (confirm('Are you sure you want to delete this link?')) {
      try {
        await deleteClientLink(linkId);
      } catch (error) {
        console.error("Failed to delete link:", error);
        // You can add a toast notification here for the error
      }
    }
  };

  const completedSteps = progressSteps.filter(step => step.completed).length;
  const totalSteps = progressSteps.length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Helper function to check if a step is overdue
  const isStepOverdue = (step: any) => {
    if (step.completed) return false;
    const now = new Date();
    const deadline = new Date(step.deadline);
    return now > deadline;
  };

  const renderProgressStep = (step: ProgressStepWithHierarchy, isChild = false) => (
    <div key={step.id} className={`group ${isChild ? 'ml-8 mt-4' : ''}`}>
      <div className={`border-2 rounded-lg sm:rounded-xl p-4 sm:p-6 transition-all duration-200 ${
        step.completed 
          ? 'border-green-200 bg-green-50' 
          : isStepOverdue(step)
          ? 'border-red-200 bg-red-50 hover:border-red-300 hover:shadow-sm'
          : 'border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm'
      } ${isChild ? 'border-l-4 border-l-blue-400' : ''}`}>
        <div className="flex items-start justify-between min-w-0 gap-2 sm:gap-4">
          <div className="flex items-start space-x-2 sm:space-x-3 lg:space-x-4 flex-1 min-w-0 overflow-hidden">
            <button
              onClick={() => handleToggleComplete(step.id)}
              disabled={user ? (user.role === 'Client Admin' || user.role === 'Client Team') : false}
              className={`mt-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                step.completed
                  ? 'bg-green-500 border-green-500 text-white shadow-sm'
                  : isStepOverdue(step)
                  ? 'border-red-400 hover:border-red-500 hover:bg-red-100'
                  : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
              } flex-shrink-0 ${
                user && (user.role === 'Client Admin' || user.role === 'Client Team') 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer'
              }`}
            >
              {step.completed && <Check className="w-3 h-3 sm:w-4 sm:h-4" />}
            </button>
            
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex flex-col space-y-1 sm:space-y-2 mb-2 sm:mb-3">
                <div className="flex-1 min-w-0 overflow-hidden">
                <h4 className={`text-sm sm:text-base lg:text-lg font-semibold leading-tight ${
                  step.completed 
                    ? 'text-green-700 line-through' 
                    : isStepOverdue(step)
                    ? 'text-red-700'
                    : 'text-slate-900'
                } break-words hyphens-auto overflow-wrap-anywhere word-break-break-word ${
                  step.isPackage ? 'text-lg font-bold' : ''
                }`}
                style={{ 
                  wordWrap: 'break-word',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  hyphens: 'auto'
                }}>
                  {step.isPackage ? step.packageName : step.title}
                </h4>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                {step.important && (
                  <span className="flex items-center space-x-1 px-1.5 sm:px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                    <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>Important</span>
                  </span>
                )}
                {step.isPackage && (
                  <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    Package
                  </span>
                )}
                {isStepOverdue(step) && (
                  <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    Overdue
                  </span>
                )}
                {step.completed && (
                  <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Completed
                  </span>
                )}
                </div>
              </div>
              
              <p className={`mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base leading-relaxed break-words hyphens-auto overflow-wrap-anywhere word-break-break-word ${
                step.completed 
                  ? 'text-slate-600 opacity-75' 
                  : isStepOverdue(step)
                  ? 'text-red-600'
                  : 'text-slate-600'
              }`}
              style={{ 
                wordWrap: 'break-word',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
                hyphens: 'auto'
              }}>
                {step.description}
              </p>
              
              <div className="flex flex-col space-y-1 sm:space-y-2 text-xs sm:text-sm mb-3 sm:mb-4">
                <div className={`flex items-center space-x-1 sm:space-x-2 ${
                  step.completed 
                    ? 'text-green-600' 
                    : isStepOverdue(step)
                    ? 'text-red-600'
                    : 'text-slate-500'
                }`}>
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-medium">Deadline:</span>
                  <span className="whitespace-nowrap">
                    {new Date(step.deadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })} at {new Date(step.deadline).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                
                {step.completed && step.completedDate && (
                  <div className="flex items-center space-x-1 sm:space-x-2 text-green-600">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="font-medium">Completed:</span>
                    <span>
                      {new Date(step.completedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="border-t border-slate-200 pt-3 sm:pt-4 mt-3 sm:mt-4">
                <div className="flex flex-col space-y-2 mb-2 sm:mb-3">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
                    <span className="text-xs sm:text-sm font-medium text-slate-700">
                      Comments ({step.comments.length})
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setCommentingStepId(step.id);
                      setShowCommentModal(true);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                  >
                    Add Comment
                  </button>
                </div>
                
                {step.comments.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3 max-h-32 sm:max-h-40 overflow-y-auto">
                    {step.comments.map((comment) => (
                      <div key={comment.id} className="bg-slate-50 rounded-lg p-2 sm:p-3 border border-slate-200 min-w-0">
                        <div className="flex flex-col space-y-1 mb-2">
                          <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-blue-600 break-words hyphens-auto overflow-wrap-anywhere word-break-break-word flex-1 min-w-0"
                          style={{ 
                            wordWrap: 'break-word',
                            overflowWrap: 'anywhere',
                            wordBreak: 'break-word',
                            hyphens: 'auto'
                          }}>
                            {comment.username}
                          </span>
                            <button
                              onClick={() => handleDeleteComment(step.id, comment.id)}
                              className="p-0.5 sm:p-1 text-red-500 hover:text-red-700 flex-shrink-0"
                            >
                              <Trash className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(comment.timestamp).toLocaleDateString()} {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {comment.text && <p className="text-xs sm:text-sm text-slate-700 break-words hyphens-auto overflow-wrap-anywhere word-break-break-word leading-relaxed"
                        style={{ 
                          wordWrap: 'break-word',
                          overflowWrap: 'anywhere',
                          wordBreak: 'break-word',
                          hyphens: 'auto'
                        }}>{comment.text}</p>}
                        {comment.attachment_url && (
                          <div className="mt-2">
                            {comment.attachment_type?.startsWith('image/') ? (
                              <img src={comment.attachment_url} alt="Attachment" className="max-w-full h-auto rounded-lg border border-slate-200" />
                            ) : (
                              <a href={comment.attachment_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center space-x-1">
                                <Link className="w-3 h-3" />
                                <span>View Attachment</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No comments yet</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
            {user && user.role !== 'Client Admin' && user.role !== 'Client Team' && (
            <button 
              onClick={() => handleEditStepOpen(step)}
              className="p-1 sm:p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            )}
            {user && user.role !== 'Client Admin' && user.role !== 'Client Team' && (
              <button 
                onClick={() => handleDeleteStep(step.id)}
                className="p-1 sm:p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all duration-200 border border-slate-200 text-sm sm:text-base"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">Customer Progress</h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">Track and manage client project milestones</p>
            </div>
          </div>
        </div>

        {/* Client Info & Progress Overview */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{client.businessName}</h2>
                  <p className="text-slate-600 text-sm sm:text-base">Progress Tracker</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddStep(true)}
                className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl flex items-center space-x-2 hover:bg-green-700 transition-all duration-200 shadow-sm font-medium text-sm sm:text-base self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Add Step</span>
              </button>
            </div>
          </div>

          {/* File Upload, Notes, and Links Section */}
          <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-200 bg-slate-50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* File Attachments */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>Attachments ({attachedFiles.length})</span>
                  </h3>
                  <button
                    onClick={() => setShowFileUpload(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Upload
                  </button>
                </div>
                <div className="space-y-2 max-h-24 sm:max-h-32 overflow-y-auto">
                  {attachedFiles.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 min-w-0">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <button
                            onClick={() => {
                              // For demo purposes, show an alert. In a real app, this would download or open the file
                              alert(`Opening ${file.name}...`);
                              // In a real implementation, you would:
                              // window.open(file.url, '_blank') or trigger download
                            }}
                            className="text-left w-full"
                          >
                            <p className="text-xs font-medium text-blue-600 hover:text-blue-800 truncate underline cursor-pointer" title={file.name}>{file.name}</p>
                          </button>
                          <p className="text-xs text-slate-500">{file.size}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-1 text-red-500 hover:text-red-700 flex-shrink-0"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {attachedFiles.length === 0 && (
                    <p className="text-xs text-slate-500 italic">No files attached</p>
                  )}
                </div>
              </div>


              {/* Website Links */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center space-x-2">
                    <Link className="w-4 h-4" />
                    <span>Links ({websiteLinks.length})</span>
                  </h3>
                  <button
                    onClick={() => setShowAddLink(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Add Link
                  </button>
                </div>
                <div className="space-y-2 max-h-24 sm:max-h-32 overflow-y-auto">
                  {websiteLinks.map(link => (
                    <div key={link.id} className="p-2 bg-white rounded-lg border border-slate-200 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 truncate block"
                            title={link.title}
                          >
                            {link.title}
                          </a>
                          <p className="text-xs text-slate-500 truncate" title={link.url}>{link.url}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="p-1 text-red-500 hover:text-red-700 flex-shrink-0 ml-2"
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {websiteLinks.length === 0 && (
                    <p className="text-xs text-slate-500 italic">No links added</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar Section */}
          <div className="px-4 sm:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900">Overall Progress</h3>
                <p className="text-xs sm:text-sm text-slate-600">{completedSteps} of {totalSteps} steps completed</p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="text-left sm:text-right">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">{progressPercentage}%</div>
                  <div className="text-xs sm:text-sm text-slate-500">Complete</div>
                </div>
              </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-200">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900">Progress Steps</h3>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">Track individual milestones and deadlines</p>
          </div>
          
          <div className="p-4 sm:p-8">
            {hierarchicalSteps.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                {hierarchicalSteps.map((step) => (
                  <div key={step.id}>
                    {renderProgressStep(step)}
                    {step.children && step.children.map((childStep) => 
                      renderProgressStep(childStep, true)
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">No progress steps yet</h3>
                <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base">Start tracking progress by adding your first milestone</p>
                <button
                  onClick={() => setShowAddStep(true)}
                  className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center space-x-2 hover:bg-green-700 transition-all duration-200 mx-auto font-medium text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Add First Step</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* File Upload Modal */}
        {showFileUpload && (
          <div className="fixed inset-0 w-full h-screen bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Upload Files</h3>
                <button
                  onClick={() => setShowFileUpload(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="p-6">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                />
                <p className="text-xs text-slate-500 mt-2">Select one or more files to upload</p>
              </div>
            </div>
          </div>
        )}

        {/* Add Note Modal */}

        {/* Add Link Modal */}
        {showAddLink && (
          <div className="fixed inset-0 w-full h-screen bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Add Website Link</h3>
                <button
                  onClick={() => setShowAddLink(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Enter link title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="https://example.com"
                  />
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => setShowAddLink(false)}
                    className="px-6 py-3 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddLink}
                    disabled={!newLinkTitle.trim() || !newLinkUrl.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Add Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Completion Date Modal */}
        {showCompletionModal && (
          <div className="fixed inset-0 w-full h-screen bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Mark as Completed</h3>
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  />
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => setShowCompletionModal(false)}
                    className="px-6 py-3 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCompleteStep}
                    disabled={!completionDate}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Mark Complete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Step Modal */}
        {showAddStep && (
          <div className="fixed inset-0 w-full h-screen bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Add Progress Step</h3>
                <button
                  onClick={() => setShowAddStep(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Step Title *
                  </label>
                  <input
                    type="text"
                    value={newStep.title}
                    onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Enter step title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Description
                  </label>
                  <textarea
                    value={newStep.description}
                    onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all duration-200"
                    placeholder="Enter step description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    value={newStep.deadline}
                    onChange={(e) => setNewStep({ ...newStep, deadline: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newStep.important}
                      onChange={(e) => setNewStep({ ...newStep, important: e.target.checked })}
                      className="w-5 h-5 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-slate-700">Mark as Important</span>
                    </div>
                  </label>
                  <p className="text-xs text-slate-500 mt-1 ml-8">Important steps require special attention and priority</p>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => setShowAddStep(false)}
                    className="px-6 py-3 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddStep}
                    disabled={!newStep.title.trim() || !newStep.deadline}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Add Step
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Step Modal */}
        {showEditStep && (
          <div className="fixed inset-0 w-full h-screen bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Edit Progress Step</h3>
                <button
                  onClick={() => setShowEditStep(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Step Title *
                  </label>
                  <input
                    type="text"
                    value={editStep.title}
                    onChange={(e) => setEditStep({ ...editStep, title: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Enter step title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Description
                  </label>
                  <textarea
                    value={editStep.description}
                    onChange={(e) => setEditStep({ ...editStep, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all duration-200"
                    placeholder="Enter step description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    value={editStep.deadline}
                    onChange={(e) => setEditStep({ ...editStep, deadline: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editStep.important}
                      onChange={(e) => setEditStep({ ...editStep, important: e.target.checked })}
                      className="w-5 h-5 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-slate-700">Mark as Important</span>
                    </div>
                  </label>
                  <p className="text-xs text-slate-500 mt-1 ml-8">Important steps require special attention and priority</p>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => setShowEditStep(false)}
                    className="px-6 py-3 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditStepSave}
                    disabled={!editStep.title.trim() || !editStep.deadline}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comment Modal */}
        {showCommentModal && (
          <div className="fixed inset-0 w-full h-screen bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Add Comment</h3>
                <button
                  onClick={() => {
                    setShowCommentModal(false);
                    setUploadedFiles([]); // Clear files on close
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Comment
                  </label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all duration-200"
                    placeholder="Enter your comment..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Attachments
                  </label>
                  <FileUpload onUploadComplete={(files) => setUploadedFiles(files)} multiple={true} />
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => {
                      setShowCommentModal(false);
                      setUploadedFiles([]); // Clear files on close
                    }}
                    className="px-6 py-3 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() && uploadedFiles.length === 0}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProgressTracker;