import React, { useState } from 'react';
import { ArrowLeft, Plus, Check, Edit, Trash2, Calendar, Clock, User, MessageCircle, Star, X, Upload, Link, FileText, Trash } from 'lucide-react';

interface ClientProgressTrackerProps {
  clientId: string;
  onBack: () => void;
}

interface Comment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
}

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  deadline: string;
  completed: boolean;
  completedDate?: string;
  important: boolean;
  comments: Comment[];
}

interface StepFormData {
  title: string;
  description: string;
  deadline: string;
  important: boolean;
}

interface AttachedFile {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
}

interface ClientNote {
  id: string;
  text: string;
  timestamp: string;
}

interface WebsiteLink {
  id: string;
  title: string;
  url: string;
  timestamp: string;
}

const ClientProgressTracker: React.FC<ClientProgressTrackerProps> = ({ clientId, onBack }) => {
  const [showAddStep, setShowAddStep] = useState(false);
  const [showEditStep, setShowEditStep] = useState(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentingStepId, setCommentingStepId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completingStepId, setCompletingStepId] = useState<string | null>(null);
  const [completionDate, setCompletionDate] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  
  const [newStep, setNewStep] = useState<StepFormData>({
    title: '',
    description: '',
    deadline: '',
    important: false
  });

  const [editStep, setEditStep] = useState<StepFormData>({
    title: '',
    description: '',
    deadline: '',
    important: false
  });

  // Mock client data - in real app, this would be fetched based on clientId
  const client = {
    id: clientId,
    name: 'Nik Salwani Bt.Nik Ab Rahman',
    progress: 33
  };

  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([
    {
      id: '1',
      name: 'project_requirements.pdf',
      size: '2.4 MB',
      uploadDate: '2025-01-15T10:30:00'
    },
    {
      id: '2',
      name: 'design_mockups.zip',
      size: '15.7 MB',
      uploadDate: '2025-01-14T14:20:00'
    }
  ]);

  const [websiteLinks, setWebsiteLinks] = useState<WebsiteLink[]>([
    {
      id: '1',
      title: 'Client Website',
      url: 'https://client-website.com',
      timestamp: '2025-01-15T11:00:00'
    },
    {
      id: '2',
      title: 'Project Documentation',
      url: 'https://docs.google.com/project-docs',
      timestamp: '2025-01-14T13:30:00'
    }
  ]);

  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([
    {
      id: '1',
      title: 'Account Setup Kuasa',
      description: 'Initial account configuration and setup',
      deadline: '2025-07-07T10:00:00',
      completed: true,
      completedDate: '2025-07-07',
      important: true,
      comments: [
        {
          id: 'c1',
          text: 'Account has been successfully created and configured',
          username: 'Ahmad Razak',
          timestamp: '2025-07-07T09:30:00'
        },
        {
          id: 'c2',
          text: 'All permissions have been set up correctly',
          username: 'Nisha KB',
          timestamp: '2025-07-07T10:15:00'
        }
      ]
    },
    {
      id: '2',
      title: 'Export Database Dalam WhatsApp',
      description: 'Export and configure WhatsApp database integration',
      deadline: '2025-07-16T10:00:00',
      completed: false,
      important: false,
      comments: [
        {
          id: 'c3',
          text: 'Waiting for client to provide WhatsApp access',
          username: 'Siti Nurhaliza',
          timestamp: '2025-07-15T14:20:00'
        }
      ]
    },
    {
      id: '3',
      title: 'Run Facebook',
      description: 'Configure and launch Facebook integration',
      deadline: '2025-07-19T10:00:00',
      completed: false,
      important: true,
      comments: []
    }
  ]);

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
      setProgressSteps(steps => 
        steps.map(step => 
          step.id === stepId 
            ? { ...step, completed: false, completedDate: undefined }
            : step
        )
      );
    }
  };

  const handleCompleteStep = () => {
    if (!completingStepId || !completionDate) return;

    setProgressSteps(steps => 
      steps.map(step => 
        step.id === completingStepId 
          ? { ...step, completed: true, completedDate: completionDate }
          : step
      )
    );

    setShowCompletionModal(false);
    setCompletingStepId(null);
    setCompletionDate('');
  };

  const handleAddStep = () => {
    if (!newStep.title.trim() || !newStep.deadline) return;
    
    const step: ProgressStep = {
      id: Date.now().toString(),
      title: newStep.title,
      description: newStep.description,
      deadline: newStep.deadline,
      completed: false,
      important: newStep.important,
      comments: []
    };
    
    setProgressSteps([...progressSteps, step]);
    setNewStep({ title: '', description: '', deadline: '', important: false });
    setShowAddStep(false);
  };

  const handleEditStepOpen = (step: ProgressStep) => {
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
    
    setProgressSteps(steps =>
      steps.map(step =>
        step.id === editingStepId
          ? {
              ...step,
              title: editStep.title,
              description: editStep.description,
              deadline: editStep.deadline,
              important: editStep.important
            }
          : step
      )
    );
    
    setShowEditStep(false);
    setEditingStepId(null);
    setEditStep({ title: '', description: '', deadline: '', important: false });
  };

  const handleDeleteStep = (stepId: string) => {
    if (confirm('Are you sure you want to delete this step?')) {
      setProgressSteps(steps => steps.filter(step => step.id !== stepId));
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !commentingStepId) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment,
      username: 'Current User', // In real app, this would be the logged-in user
      timestamp: new Date().toISOString()
    };
    
    setProgressSteps(steps =>
      steps.map(step =>
        step.id === commentingStepId
          ? { ...step, comments: [...step.comments, comment] }
          : step
      )
    );
    
    setNewComment('');
    setShowCommentModal(false);
    setCommentingStepId(null);
  };

  const handleDeleteComment = (stepId: string, commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      setProgressSteps(steps =>
        steps.map(step =>
          step.id === stepId
            ? { ...step, comments: step.comments.filter(c => c.id !== commentId) }
            : step
        )
      );
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

  const handleAddLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;

    const link: WebsiteLink = {
      id: Date.now().toString(),
      title: newLinkTitle,
      url: newLinkUrl,
      timestamp: new Date().toISOString()
    };

    setWebsiteLinks(prev => [...prev, link]);
    setNewLinkTitle('');
    setNewLinkUrl('');
    setShowAddLink(false);
  };

  const handleDeleteLink = (linkId: string) => {
    if (confirm('Are you sure you want to delete this link?')) {
      setWebsiteLinks(links => links.filter(l => l.id !== linkId));
    }
  };

  const completedSteps = progressSteps.filter(step => step.completed).length;
  const totalSteps = progressSteps.length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Helper function to check if a step is overdue
  const isStepOverdue = (step: ProgressStep) => {
    if (step.completed) return false;
    const now = new Date();
    const deadline = new Date(step.deadline);
    return now > deadline;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all duration-200 border border-slate-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Customer Progress</h1>
              <p className="text-slate-600 mt-1">Track and manage client project milestones</p>
            </div>
          </div>
        </div>

        {/* Client Info & Progress Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{client.name}</h2>
                  <p className="text-slate-600">Progress Tracker</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddStep(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-green-700 transition-all duration-200 shadow-sm font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Add Step</span>
              </button>
            </div>
          </div>

          {/* File Upload, Notes, and Links Section */}
          <div className="px-8 py-6 border-b border-slate-200 bg-slate-50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* File Attachments */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
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
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {attachedFiles.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-900 truncate">{file.name}</p>
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
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
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
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {websiteLinks.map(link => (
                    <div key={link.id} className="p-2 bg-white rounded-lg border border-slate-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 truncate block"
                          >
                            {link.title}
                          </a>
                          <p className="text-xs text-slate-500 truncate">{link.url}</p>
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
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Overall Progress</h3>
                <p className="text-sm text-slate-600">{completedSteps} of {totalSteps} steps completed</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{progressPercentage}%</div>
                <div className="text-sm text-slate-500">Complete</div>
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">Progress Steps</h3>
            <p className="text-slate-600 mt-1">Track individual milestones and deadlines</p>
          </div>
          
          <div className="p-8">
            {progressSteps.length > 0 ? (
              <div className="space-y-6">
                {progressSteps.map((step, index) => (
                  <div key={step.id} className="group">
                    <div className={`border-2 rounded-xl p-6 transition-all duration-200 ${
                      step.completed 
                        ? 'border-green-200 bg-green-50' 
                        : isStepOverdue(step)
                        ? 'border-red-200 bg-red-50 hover:border-red-300 hover:shadow-sm'
                        : 'border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <button
                            onClick={() => handleToggleComplete(step.id)}
                            className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                              step.completed
                                ? 'bg-green-500 border-green-500 text-white shadow-sm'
                                : isStepOverdue(step)
                                ? 'border-red-400 hover:border-red-500 hover:bg-red-100'
                                : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
                            }`}
                          >
                            {step.completed && <Check className="w-4 h-4" />}
                          </button>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className={`text-lg font-semibold ${
                                step.completed 
                                  ? 'text-green-700 line-through' 
                                  : isStepOverdue(step)
                                  ? 'text-red-700'
                                  : 'text-slate-900'
                              }`}>
                                {step.title}
                              </h4>
                              {step.important && (
                                <span className="flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                  <Star className="w-3 h-3" />
                                  <span>Important</span>
                                </span>
                              )}
                              {isStepOverdue(step) && (
                                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                  Overdue
                                </span>
                              )}
                              {step.completed && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                  Completed
                                </span>
                              )}
                            </div>
                            
                            <p className={`mb-4 ${
                              step.completed 
                                ? 'text-slate-600 opacity-75' 
                                : isStepOverdue(step)
                                ? 'text-red-600'
                                : 'text-slate-600'
                            }`}>
                              {step.description}
                            </p>
                            
                            <div className="flex items-center space-x-6 text-sm mb-4">
                              <div className={`flex items-center space-x-2 ${
                                step.completed 
                                  ? 'text-green-600' 
                                  : isStepOverdue(step)
                                  ? 'text-red-600'
                                  : 'text-slate-500'
                              }`}>
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">Deadline:</span>
                                <span>
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
                                <div className="flex items-center space-x-2 text-green-600">
                                  <Check className="w-4 h-4" />
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
                            <div className="border-t border-slate-200 pt-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <MessageCircle className="w-4 h-4 text-slate-500" />
                                  <span className="text-sm font-medium text-slate-700">
                                    Comments ({step.comments.length})
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    setCommentingStepId(step.id);
                                    setShowCommentModal(true);
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  Add Comment
                                </button>
                              </div>
                              
                              {step.comments.length > 0 ? (
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                  {step.comments.map((comment) => (
                                    <div key={comment.id} className="bg-slate-50 rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium text-blue-600">
                                          {comment.username}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-xs text-slate-500">
                                            {new Date(comment.timestamp).toLocaleDateString()} {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                          <button
                                            onClick={() => handleDeleteComment(step.id, comment.id)}
                                            className="p-1 text-red-500 hover:text-red-700"
                                          >
                                            <Trash className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                      <p className="text-sm text-slate-700">{comment.text}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-500 italic">No comments yet</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button 
                            onClick={() => handleEditStepOpen(step)}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteStep(step.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No progress steps yet</h3>
                <p className="text-slate-600 mb-6">Start tracking progress by adding your first milestone</p>
                <button
                  onClick={() => setShowAddStep(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:bg-blue-700 transition-all duration-200 mx-auto font-medium"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add First Step</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* File Upload Modal */}
        {showFileUpload && (
          <div className="fixed inset-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
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
          <div className="fixed inset-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
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
          <div className="fixed inset-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
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
          <div className="fixed inset-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
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
          <div className="fixed inset-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
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
          <div className="fixed inset-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Add Comment</h3>
                <button
                  onClick={() => setShowCommentModal(false)}
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
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => setShowCommentModal(false)}
                    className="px-6 py-3 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
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