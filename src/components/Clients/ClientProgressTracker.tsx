import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../../store/AppStore';
import { Client, Invoice, Component, ProgressStep as StoreProgressStep } from '../../store/AppStore';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Calendar, 
  MessageSquare, 
  Upload, 
  Download, 
  Link as LinkIcon,
  RefreshCw,
  AlertTriangle,
  FileText,
  Eye,
  EyeOff,
  Clock,
  AlertCircle,
  Star,
  MessageCircle,
  User,
  Trash,
  UploadCloud
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import ConfirmationModal from '../common/ConfirmationModal';
import { useConfirmation } from '../../hooks/useConfirmation';
import { useSupabase } from '../../hooks/useSupabase';

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
  clientId?: number;
  createdAt?: string;
  updatedAt?: string;
  // New deadline fields for parent items
  onboardingDeadline?: string;
  firstDraftDeadline?: string;
  secondDraftDeadline?: string;
  onboardingCompleted?: boolean;
  firstDraftCompleted?: boolean;
  secondDraftCompleted?: boolean;
  onboardingCompletedDate?: string;
  firstDraftCompletedDate?: string;
  secondDraftCompletedDate?: string;
}

interface AttachedFile {
  id: number;
  clientId: number;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  fileType?: string;
  uploadDate: string;
  createdAt: string;
  updatedAt: string;
}

const ClientProgressTracker: React.FC<ClientProgressTrackerProps> = ({ clientId, onBack }) => {
  const { user } = useSupabase();
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
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isDeletingLink, setIsDeletingLink] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [commentAttachment, setCommentAttachment] = useState<File | null>(null);
  const [isUploadingCommentAttachment, setIsUploadingCommentAttachment] = useState(false);
  
  // Deadline editing state
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [editingDeadlineStepId, setEditingDeadlineStepId] = useState<string | null>(null);
  const [editingDeadlineType, setEditingDeadlineType] = useState<'onboarding' | 'firstDraft' | 'secondDraft' | null>(null);
  const [newDeadlineDate, setNewDeadlineDate] = useState('');
  const [isUpdatingDeadline, setIsUpdatingDeadline] = useState(false);
  
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
    getComponentsByClientId,
    addProgressStep,
    updateProgressStep,
    deleteProgressStep,
    deleteInvoice,
    deleteComponent,
    fetchInvoices,
    fetchComponents,
    fetchProgressSteps,
    fetchClientLinks,
    addClientLink,
    deleteClientLink,
    getClientLinksByClientId,
    addCommentToStep,
    deleteCommentFromStep,
    calculateClientProgressStatus,
    addClientFile,
    deleteClientFile,
    getClientFilesByClientId,
    fetchClientFiles
  } = useAppStore();
  const { success, error } = useToast();

  // Custom confirmation modal
  const { confirmation, showConfirmation, hideConfirmation, handleConfirm } = useConfirmation();

  const client = getClientById(parseInt(clientId));
  const websiteLinks = getClientLinksByClientId(parseInt(clientId));
  const attachedFiles = getClientFilesByClientId(parseInt(clientId));
  
  // Debug logging
  console.log('🔍 Debug ClientProgressTracker:');
  console.log('  Client ID:', clientId);
  console.log('  Attached Files:', attachedFiles);
  console.log('  Attached Files Length:', attachedFiles.length);
  console.log('  Website Links:', websiteLinks);
  
  // Debug individual files
  if (attachedFiles.length > 0) {
    console.log('  Sample attached file:', {
      id: attachedFiles[0].id,
      clientId: attachedFiles[0].clientId,
      fileName: attachedFiles[0].fileName,
      fileSize: attachedFiles[0].fileSize
    });
  }

  const progressSteps = getProgressStepsByClientId(parseInt(clientId));
  const clientInvoices = getInvoicesByClientId(parseInt(clientId));
  const clientComponents = getComponentsByClientId(parseInt(clientId));

  // Debug logging for comments
  console.log('🔍 Debug Comments:');
  progressSteps.forEach(step => {
    if (step.comments && step.comments.length > 0) {
      console.log(`  Step "${step.title}" has ${step.comments.length} comments:`, step.comments);
    }
  });

  // Debug: Check store data
  console.log('🔍 Debug Store Data:');
  console.log('  Total progress steps:', progressSteps.length);
  console.log('  Steps with comments:', progressSteps.filter(s => s.comments && s.comments.length > 0).length);
  console.log('  All steps:', progressSteps.map(s => ({ title: s.title, comments: s.comments?.length || 0 })));

  // Create hierarchical structure for progress steps
  const createHierarchicalSteps = (): ProgressStepWithHierarchy[] => {
    const hierarchicalSteps: ProgressStepWithHierarchy[] = [];
    const usedStepIds = new Set<string>(); // Track which steps have been used
    
    console.log('🔍 Debug createHierarchicalSteps:');
    console.log('  Progress Steps:', progressSteps.map(s => ({ id: s.id, title: s.title })));
    console.log('  Client Components:', clientComponents.map(c => ({ id: c.id, name: c.name, invoiceId: c.invoiceId })));
    console.log('  Client Invoices:', clientInvoices.map(i => ({ id: i.id, packageName: i.packageName })));
    
    // Group steps by package
    clientInvoices.forEach(invoice => {
      console.log(`\n📦 Processing invoice: ${invoice.packageName} (${invoice.id})`);
      
      // Find package step
      const packageStep = progressSteps.find(step => 
        step.title === `${invoice.packageName} - Package Setup`
      );
      
      if (packageStep) {
        console.log(`  ✅ Found package step: ${packageStep.title}`);
        
        // Find component steps for this package - match by component name and invoice
        const componentSteps = progressSteps.filter(step => {
          // Skip package setup steps
          if (step.title.includes(' - Package Setup')) return false;
          
          // Check if this step matches a component from this invoice
          const matchingComponent = clientComponents.find(comp => 
            comp.invoiceId === invoice.id && comp.name === step.title
          );
          
          return matchingComponent !== undefined;
        });
        
        console.log(`  📋 Found ${componentSteps.length} component steps:`, componentSteps.map(s => s.title));
        
        // Sort component steps by creation date (oldest first) to maintain proper order
        const sortedComponentSteps = componentSteps.sort((a, b) => {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
        
        // Mark these steps as used
        sortedComponentSteps.forEach(step => usedStepIds.add(step.id));
        
        const packageWithChildren: ProgressStepWithHierarchy = {
          ...packageStep,
          isPackage: true,
          packageName: invoice.packageName,
          // Map new deadline fields
          onboardingDeadline: packageStep.onboardingDeadline,
          firstDraftDeadline: packageStep.firstDraftDeadline,
          secondDraftDeadline: packageStep.secondDraftDeadline,
          onboardingCompleted: packageStep.onboardingCompleted,
          firstDraftCompleted: packageStep.firstDraftCompleted,
          secondDraftCompleted: packageStep.secondDraftCompleted,
          onboardingCompletedDate: packageStep.onboardingCompletedDate,
          firstDraftCompletedDate: packageStep.firstDraftCompletedDate,
          secondDraftCompletedDate: packageStep.secondDraftCompletedDate,
          children: sortedComponentSteps.map(step => ({
            ...step,
            isPackage: false,
            packageName: invoice.packageName
          }))
        };
        
        // Debug: Check if comments are preserved
        console.log(`  📦 Package "${invoice.packageName}" comments:`, packageWithChildren.comments?.length || 0);
        packageWithChildren.children?.forEach(child => {
          if (child.comments && child.comments.length > 0) {
            console.log(`    📋 Child "${child.title}" comments:`, child.comments.length);
          }
        });
        
        hierarchicalSteps.push(packageWithChildren);
      } else {
        console.log(`  ❌ No package step found, creating virtual package`);
        
        // If no package step exists, create one and group components under it
        const packageComponents = clientComponents.filter(comp => comp.invoiceId === invoice.id);
        console.log(`  📦 Package components:`, packageComponents.map(c => c.name));
        
        if (packageComponents.length > 0) {
          // Find component steps for this package
          const componentSteps = progressSteps.filter(step => {
            // Skip package setup steps
            if (step.title.includes(' - Package Setup')) return false;
            
            // Check if this step matches a component from this invoice
            const matchingComponent = packageComponents.find(comp => comp.name === step.title);
            return matchingComponent !== undefined;
          });
          
          console.log(`  📋 Found ${componentSteps.length} component steps:`, componentSteps.map(s => s.title));
          
          // Sort component steps by creation date (oldest first)
          const sortedComponentSteps = componentSteps.sort((a, b) => {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          });
          
          // Mark these steps as used
          sortedComponentSteps.forEach(step => usedStepIds.add(step.id));
          
          // Create a virtual package step
          const virtualPackageStep: ProgressStepWithHierarchy = {
            id: `virtual-${invoice.id}`,
            clientId: parseInt(clientId),
            title: `${invoice.packageName} - Package Setup`,
            description: `Complete the setup and delivery of ${invoice.packageName} package`,
            deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            completed: false,
            important: true,
            comments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPackage: true,
            packageName: invoice.packageName,
            // Set default deadline fields
            onboardingDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            firstDraftDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            secondDraftDeadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
            onboardingCompleted: false,
            firstDraftCompleted: false,
            secondDraftCompleted: false,
            children: sortedComponentSteps.map(step => ({
              ...step,
              isPackage: false,
              packageName: invoice.packageName
            }))
          };
          
          hierarchicalSteps.push(virtualPackageStep);
        }
      }
    });
    
    console.log(`\n📝 Used step IDs:`, Array.from(usedStepIds));
    
    // Add any standalone steps (manually added steps that don't belong to a package)
    const standaloneSteps = progressSteps.filter(step => {
      // Skip package setup steps
      if (step.title.includes(' - Package Setup')) return false;
      
      // Skip steps that have already been used in packages
      if (usedStepIds.has(step.id)) return false;
      
      // Include truly standalone steps
      return true;
    });
    
    console.log(`\n🆓 Standalone steps:`, standaloneSteps.map(s => s.title));
    
    // Sort standalone steps by creation date (oldest first)
    const sortedStandaloneSteps = standaloneSteps.sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    
    sortedStandaloneSteps.forEach(step => {
      hierarchicalSteps.push({
        ...step,
        isPackage: false
      });
    });
    
    console.log(`\n🏗️ Final hierarchical structure:`, hierarchicalSteps.map(h => ({
      title: h.title,
      isPackage: h.isPackage,
      childrenCount: h.children?.length || 0
    })));
    
    return hierarchicalSteps;
  };

  const hierarchicalSteps = createHierarchicalSteps();

  // Fetch all required data when component loads
  useEffect(() => {
    const loadData = async () => {
      if (clientId) {
        console.log('🔄 Loading all data for client:', clientId);
        try {
          // Fetch all data needed for hierarchical structure
          await fetchInvoices();
          await fetchComponents();
          await fetchProgressSteps();
          
          // Fetch client-specific data
          if (client) {
            await fetchClientLinks(client.id);
          }
          await fetchClientFiles(parseInt(clientId));
          
          console.log('✅ All data loaded successfully');
        } catch (error) {
          console.error('❌ Error loading data:', error);
        }
      }
    };
    
    loadData();
  }, [clientId, client, fetchInvoices, fetchComponents, fetchProgressSteps, fetchClientLinks, fetchClientFiles]);

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

  const handleToggleComplete = async (stepId: string) => {
    const step = progressSteps.find(s => s.id === stepId);
    if (!step) return;

    if (!step.completed) {
      // Show completion modal to select date
      setCompletingStepId(stepId);
      setCompletionDate(new Date().toISOString().split('T')[0]);
      setShowCompletionModal(true);
    } else {
      // Uncomplete the step
      await updateProgressStep(stepId, { completed: false, completedDate: undefined });
      
      // If this is a package step, also uncomplete all its component steps
      if (step.title.includes(' - Package Setup')) {
        const packageName = step.title.replace(' - Package Setup', '');
        const componentSteps = progressSteps.filter(s => 
          s.title !== step.title && 
          s.title !== `${packageName} - Package Setup` &&
          clientComponents.some(comp => comp.name === s.title)
        );
        
        for (const componentStep of componentSteps) {
          await updateProgressStep(componentStep.id, { completed: false, completedDate: undefined });
        }
      }
    }
  };

  const handleCompleteStep = async () => {
    if (!completingStepId || !completionDate) return;

    const step = progressSteps.find(s => s.id === completingStepId);
    if (!step) return;

    // Complete the main step
    await updateProgressStep(completingStepId, { completed: true, completedDate: completionDate });

    // If this is a package step, also complete all its component steps
    if (step.title.includes(' - Package Setup')) {
      const packageName = step.title.replace(' - Package Setup', '');
      const componentSteps = progressSteps.filter(s => 
        s.title !== step.title && 
        s.title !== `${packageName} - Package Setup` &&
        clientComponents.some(comp => comp.name === s.title)
      );
      
      for (const componentStep of componentSteps) {
        await updateProgressStep(componentStep.id, { completed: true, completedDate: completionDate });
      }
    }

    setShowCompletionModal(false);
    setCompletingStepId(null);
    setCompletionDate('');
  };

  const handleAddStep = () => {
    if (!newStep.title.trim() || !newStep.deadline) return;
    
    // Convert datetime-local to ISO string
    const deadlineDate = new Date(newStep.deadline);
    const isoDeadline = deadlineDate.toISOString();
    
    addProgressStep({
      clientId: parseInt(clientId),
      title: newStep.title,
      description: newStep.description,
      deadline: isoDeadline,
      completed: false,
      important: newStep.important,
      comments: []
    });
    
    setNewStep({ title: '', description: '', deadline: '', important: false });
    setShowAddStep(false);
  };

  const handleEditStepOpen = (step: any) => {
    setEditingStepId(step.id);
    
    // Convert deadline to datetime-local format (YYYY-MM-DDTHH:MM)
    const deadlineDate = new Date(step.deadline);
    const formattedDeadline = deadlineDate.toISOString().slice(0, 16);
    
    setEditStep({
      title: step.title,
      description: step.description,
      deadline: formattedDeadline,
      important: step.important
    });
    setShowEditStep(true);
  };

  const handleEditStepSave = async () => {
    if (!editStep.title.trim() || !editStep.deadline || !editingStepId) return;
    
    // Convert datetime-local to ISO string
    const deadlineDate = new Date(editStep.deadline);
    const isoDeadline = deadlineDate.toISOString();
    
    await updateProgressStep(editingStepId, {
      title: editStep.title,
      description: editStep.description,
      deadline: isoDeadline,
      important: editStep.important
    });
    
    setShowEditStep(false);
    setEditingStepId(null);
    setEditStep({ title: '', description: '', deadline: '', important: false });
  };

  const handleDeleteStep = (stepId: string) => {
    showConfirmation(
      () => deleteProgressStep(stepId),
      {
        title: 'Delete Step',
        message: 'Are you sure you want to delete this step?',
        confirmText: 'Delete',
        type: 'danger'
      }
    );
  };

  const handleAddComment = async () => {
    if (!newComment.trim() && !commentAttachment) {
      alert("Please add a comment or attachment.");
      return;
    }
    if (!commentingStepId) return;

    setIsAddingComment(true);
    setIsUploadingCommentAttachment(true);
    
    try {
      let attachmentUrl = '';
      let attachmentType = '';

      // Upload attachment if present
      if (commentAttachment) {
        console.log('🔄 Uploading comment attachment:', commentAttachment.name);
        
        // 1. Get pre-signed URL from our API
        const res = await fetch('/api/generate-upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            fileName: commentAttachment.name, 
            fileType: commentAttachment.type 
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ API Error:', errorText);
          throw new Error(`Failed to get upload URL: ${res.status} ${errorText}`);
        }

        const responseData = await res.json();
        const { uploadUrl, fileUrl } = responseData;
        
        if (!uploadUrl || !fileUrl) {
          throw new Error('Invalid response: missing uploadUrl or fileUrl');
        }

        // 2. Upload file to DigitalOcean Spaces
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', uploadUrl, true);
          
          xhr.onload = () => {
            if (xhr.status === 200) {
              console.log('✅ Comment attachment uploaded successfully!');
              attachmentUrl = fileUrl;
              attachmentType = commentAttachment.type;
              resolve();
            } else {
              console.error('❌ Upload failed with status:', xhr.status);
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => {
            reject(new Error('Network error during upload.'));
          };
          
          xhr.send(commentAttachment);
        });
      }

      // Add comment with attachment
      await addCommentToStep(commentingStepId, {
        text: newComment,
        username: user?.name || 'Admin',
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
      });

      // Reset state
      setNewComment('');
      setCommentAttachment(null);
      setShowCommentModal(false);
      setCommentingStepId(null);
      
      success('Comment Added', 'Comment has been added successfully');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      error('Add Comment Failed', 'Failed to add comment. Please try again.');
    } finally {
      setIsAddingComment(false);
      setIsUploadingCommentAttachment(false);
    }
  };

  const handleDeleteComment = async (stepId: string, commentId: string) => {
    showConfirmation(
      () => deleteCommentFromStep(stepId, commentId),
      {
        title: 'Delete Comment',
        message: 'Are you sure you want to delete this comment?',
        confirmText: 'Delete',
        type: 'danger'
      }
    );
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploadingFile(true);

    try {
      for (const file of Array.from(files)) {
        // 1. Get pre-signed URL from our API
        console.log('🔄 Requesting upload URL for:', file.name);
        const res = await fetch('/api/generate-upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, fileType: file.type }),
        });

        console.log('📡 API Response status:', res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ API Error:', errorText);
          
          // Check if it's a configuration error
          if (errorText.includes('File upload not configured')) {
            error('Upload Not Configured', 'File upload is not configured. Please contact administrator.');
            return;
          }
          
          throw new Error(`Failed to get upload URL: ${res.status} ${errorText}`);
        }

        const responseData = await res.json();
        console.log('✅ API Response data:', responseData);
        
        const { uploadUrl, fileUrl } = responseData;
        
        if (!uploadUrl || !fileUrl) {
          throw new Error('Invalid response: missing uploadUrl or fileUrl');
        }

        // 2. Upload file to DigitalOcean Spaces
        console.log('📤 Starting file upload to DigitalOcean Spaces...');
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', uploadUrl, true);
          
          xhr.onload = async () => {
            console.log('📡 Upload response status:', xhr.status);
            if (xhr.status === 200) {
              console.log('✅ File uploaded successfully!');
              const newFile = {
                clientId: parseInt(clientId),
                fileName: file.name,
                fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                fileUrl: fileUrl,
                fileType: file.type,
                uploadDate: new Date().toISOString()
              };
              await addClientFile(newFile);
              success('File Uploaded', `${file.name} has been uploaded successfully`);
              // Refresh client files to show the new file
              await fetchClientFiles(parseInt(clientId));
              resolve();
            } else {
              console.error('❌ Upload failed with status:', xhr.status);
              console.error('❌ Upload response:', xhr.responseText);
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = (error) => {
            console.error('❌ Network error during upload:', error);
            reject(new Error('Network error during upload.'));
          };
          
          console.log('📤 Sending file to DigitalOcean Spaces...');
          xhr.send(file);
        });

      }
    } catch (err) {
      console.error('Error uploading file:', err);
      error('Upload Failed', 'Failed to upload file. Please try again.');
    } finally {
      setIsUploadingFile(false);
      setShowFileUpload(false);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    showConfirmation(
      () => deleteClientFile(fileId),
      {
        title: 'Delete File',
        message: 'Are you sure you want to delete this file?',
        confirmText: 'Delete',
        type: 'danger'
      }
    );
  };

  const handleAddLink = async () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim() || !client) return;

    setIsAddingLink(true);
    
    try {
      let correctedUrl = newLinkUrl.trim();
      if (!correctedUrl.startsWith('http://') && !correctedUrl.startsWith('https://')) {
        correctedUrl = 'https://' + correctedUrl;
      }

      await addClientLink({
        client_id: client.id,
        title: newLinkTitle,
        url: correctedUrl,
        created_by: user?.role === 'Client Admin' || user?.role === 'Client Team' ? 'client' : 'admin',
        link_type: user?.role === 'Client Admin' || user?.role === 'Client Team' ? 'client' : 'admin',
        user_id: user?.id,
        user_role: user?.role
      });

      success('Link Added', `${newLinkTitle} has been added successfully`);
      
      // Reset form and close modal
      setNewLinkTitle('');
      setNewLinkUrl('');
      setShowAddLink(false);
    } catch (err) {
      console.error("Failed to add link:", err);
      if (err instanceof Error && err.message.includes('client_links tidak wujud')) {
        error('Database Error', 'Table client_links tidak wujud. Sila jalankan: npm run db:create-links');
      } else {
        error('Add Link Failed', 'Gagal menambah link. Sila cuba semula.');
      }
    } finally {
      setIsAddingLink(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    showConfirmation(
      () => {
        setIsDeletingLink(true);
        deleteClientLink(linkId)
          .then(() => {
            success('Link Deleted', 'Link has been deleted successfully');
          })
          .catch((err) => {
            console.error("Failed to delete link:", err);
            if (err instanceof Error && err.message.includes('client_links tidak wujud')) {
              error('Database Error', 'Table client_links tidak wujud. Sila jalankan: npm run db:create-links');
            } else {
              error('Delete Link Failed', 'Gagal memadamkan link. Sila cuba semula.');
            }
          })
          .finally(() => {
            setIsDeletingLink(false);
          });
      },
      {
        title: 'Delete Link',
        message: 'Are you sure you want to delete this link?',
        confirmText: 'Delete',
        type: 'danger'
      }
    );
  };

  const handleClearAllSteps = async () => {
    showConfirmation(
      async () => {
        try {
          console.log('🗑️ Starting complete cleanup...');
          
          // Refresh data from database first to ensure sync
          console.log('🔄 Refreshing data from database...');
          await Promise.all([
            fetchInvoices(),
            fetchComponents(),
            fetchProgressSteps()
          ]);
          console.log('✅ Data refreshed from database');
          
          // Get all invoices for this client
          const clientInvoices = getInvoicesByClientId(parseInt(clientId));
          console.log(`Found ${clientInvoices.length} invoices to delete`);
          
          // Delete all invoices and their components
          for (const invoice of clientInvoices) {
            console.log(`Deleting invoice: ${invoice.packageName} (${invoice.id})`);
            
            // Get components for this invoice
            const invoiceComponents = clientComponents.filter(comp => comp.invoiceId === invoice.id);
            console.log(`Found ${invoiceComponents.length} components to delete`);
            
            // Delete all components for this invoice with error handling
            for (const component of invoiceComponents) {
              try {
                console.log(`Deleting component: ${component.name} (${component.id})`);
                await deleteComponent(component.id);
              } catch (componentError) {
                console.warn(`Failed to delete component ${component.name}:`, componentError);
                // Continue with other components even if one fails
              }
            }
            
            // Delete the invoice
            try {
              await deleteInvoice(invoice.id);
            } catch (invoiceError) {
              console.warn(`Failed to delete invoice ${invoice.packageName}:`, invoiceError);
              // Continue with other invoices even if one fails
            }
          }
          
          // Delete all progress steps for this client
          console.log(`Deleting ${progressSteps.length} progress steps`);
          for (const step of progressSteps) {
            try {
              await deleteProgressStep(step.id);
            } catch (stepError) {
              console.warn(`Failed to delete progress step ${step.title}:`, stepError);
              // Continue with other steps even if one fails
            }
          }
          
          console.log('✅ Complete cleanup finished');
          alert('All progress steps, invoices, and components have been deleted successfully.');
          
          // Refresh the page to show empty state
          window.location.reload();
          
        } catch (error) {
          console.error('Failed to delete data:', error);
          alert('Failed to delete data. Please try again.');
        }
      },
      {
        title: 'Clear All Data',
        message: 'Are you sure you want to delete ALL progress steps, invoices, and components? This action cannot be undone.',
        confirmText: 'Clear All',
        type: 'danger'
      }
    );
  };

  // Use consistent progress calculation from store
  const progressStatus = calculateClientProgressStatus(parseInt(clientId));
  const { completedSteps, totalSteps, percentage: progressPercentage } = progressStatus;

  // Helper function to check if a step is overdue
  const isStepOverdue = (step: any) => {
    if (step.completed) return false;
    const now = new Date();
    const deadline = new Date(step.deadline);
    return now > deadline;
  };

  // Helper function to check if deadline is overdue
  const isDeadlineOverdue = (deadline: string | null | undefined, completed: boolean) => {
    if (!deadline || completed) return false;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    return now > deadlineDate;
  };

  // Helper function to handle deadline editing
  const handleEditDeadline = (stepId: string, deadlineType: 'onboarding' | 'firstDraft' | 'secondDraft') => {
    const step = progressSteps.find(s => s.id === stepId);
    if (!step) return;
    
    setEditingDeadlineStepId(stepId);
    setEditingDeadlineType(deadlineType);
    
    // Get current deadline value
    let currentDeadline = '';
    switch (deadlineType) {
      case 'onboarding':
        currentDeadline = step.onboardingDeadline || '';
        break;
      case 'firstDraft':
        currentDeadline = step.firstDraftDeadline || '';
        break;
      case 'secondDraft':
        currentDeadline = step.secondDraftDeadline || '';
        break;
    }
    
    // Convert to date input format (YYYY-MM-DD)
    if (currentDeadline) {
      const date = new Date(currentDeadline);
      setNewDeadlineDate(date.toISOString().split('T')[0]);
    } else {
      setNewDeadlineDate('');
    }
    
    setShowDeadlineModal(true);
  };

  // Helper function to save deadline changes
  const handleSaveDeadline = async () => {
    if (!editingDeadlineStepId || !editingDeadlineType || !newDeadlineDate) return;
    
    setIsUpdatingDeadline(true);
    try {
      const step = progressSteps.find(s => s.id === editingDeadlineStepId);
      if (!step) return;
      
      // Convert date to ISO string
      const deadlineDate = new Date(newDeadlineDate + 'T00:00:00');
      const isoDeadline = deadlineDate.toISOString();
      
      // Prepare update object
      const updates: any = {};
      switch (editingDeadlineType) {
        case 'onboarding':
          updates.onboardingDeadline = isoDeadline;
          break;
        case 'firstDraft':
          updates.firstDraftDeadline = isoDeadline;
          break;
        case 'secondDraft':
          updates.secondDraftDeadline = isoDeadline;
          break;
      }
      
      await updateProgressStep(editingDeadlineStepId, updates);
      success(`Deadline updated successfully!`);
      
      setShowDeadlineModal(false);
      setEditingDeadlineStepId(null);
      setEditingDeadlineType(null);
      setNewDeadlineDate('');
    } catch (error: any) {
      console.error('Error updating deadline:', error);
      error('Failed to update deadline');
    } finally {
      setIsUpdatingDeadline(false);
    }
  };

  const renderProgressStep = (step: ProgressStepWithHierarchy, isChild = false) => (
    <div key={step.id} className={`group ${isChild ? 'ml-8 mt-4' : ''}`}>
      <div className={`border-2 rounded-lg sm:rounded-xl p-4 sm:p-6 transition-all duration-200 ${
        step.completed 
          ? 'border-green-200 bg-green-50' 
          : isStepOverdue(step)
          ? 'border-red-200 bg-red-50 hover:border-red-300 hover:shadow-sm'
          : step.isPackage
          ? 'border-blue-300 bg-blue-50 hover:border-blue-400 hover:shadow-md'
          : 'border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm'
      } ${isChild ? 'border-l-4 border-l-blue-400' : step.isPackage ? 'border-l-4 border-l-blue-500' : ''}`}>
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
                  step.isPackage ? 'text-xl font-bold' : ''
                }`}
                style={{ 
                  wordWrap: 'break-word',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  hyphens: 'auto'
                }}>
                  {step.isPackage ? (
                    <span className="flex items-center space-x-2">
                      <span className="text-2xl">📦</span>
                      <span>{step.packageName}</span>
                    </span>
                  ) : (
                    step.title
                  )}
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
                {!step.isPackage && step.packageName && (
                  <span className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    From: {step.packageName}
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
                {/* For package steps, show all deadline fields */}
                {step.isPackage ? (
                  <div className="space-y-2">
                    {/* Onboarding Deadline */}
                    <div className={`flex items-center justify-between p-2 rounded-lg border ${
                      step.onboardingCompleted 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : isDeadlineOverdue(step.onboardingDeadline, step.onboardingCompleted || false)
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-blue-50 border-blue-200 text-blue-700'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="font-medium">Onboarding:</span>
                        <span className="whitespace-nowrap">
                          {step.onboardingDeadline ? 
                            new Date(step.onboardingDeadline).toLocaleDateString('en-MY', {
                              day: '2-digit',
                              month: 'short',
                              year: '2-digit'
                            }) : 'Not set'
                          }
                        </span>
                        {step.onboardingCompleted && (
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        )}
                      </div>
                      {user && user.role !== 'Client Admin' && user.role !== 'Client Team' && (
                        <button
                          onClick={() => handleEditDeadline(step.id, 'onboarding')}
                          className="text-xs hover:underline font-medium"
                        >
                          Edit
                        </button>
                      )}
                    </div>

                    {/* First Draft Deadline */}
                    <div className={`flex items-center justify-between p-2 rounded-lg border ${
                      step.firstDraftCompleted 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : isDeadlineOverdue(step.firstDraftDeadline, step.firstDraftCompleted || false)
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-blue-50 border-blue-200 text-blue-700'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="font-medium">First Draft:</span>
                        <span className="whitespace-nowrap">
                          {step.firstDraftDeadline ? 
                            new Date(step.firstDraftDeadline).toLocaleDateString('en-MY', {
                              day: '2-digit',
                              month: 'short',
                              year: '2-digit'
                            }) : 'Not set'
                          }
                        </span>
                        {step.firstDraftCompleted && (
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        )}
                      </div>
                      {user && user.role !== 'Client Admin' && user.role !== 'Client Team' && (
                        <button
                          onClick={() => handleEditDeadline(step.id, 'firstDraft')}
                          className="text-xs hover:underline font-medium"
                        >
                          Edit
                        </button>
                      )}
                    </div>

                    {/* Second Draft Deadline */}
                    <div className={`flex items-center justify-between p-2 rounded-lg border ${
                      step.secondDraftCompleted 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : isDeadlineOverdue(step.secondDraftDeadline, step.secondDraftCompleted || false)
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-blue-50 border-blue-200 text-blue-700'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="font-medium">Second Draft:</span>
                        <span className="whitespace-nowrap">
                          {step.secondDraftDeadline ? 
                            new Date(step.secondDraftDeadline).toLocaleDateString('en-MY', {
                              day: '2-digit',
                              month: 'short',
                              year: '2-digit'
                            }) : 'Not set'
                          }
                        </span>
                        {step.secondDraftCompleted && (
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        )}
                      </div>
                      {user && user.role !== 'Client Admin' && user.role !== 'Client Team' && (
                        <button
                          onClick={() => handleEditDeadline(step.id, 'secondDraft')}
                          className="text-xs hover:underline font-medium"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* For regular steps, show original deadline */
                  <div className={`flex items-center justify-between ${
                    step.completed 
                      ? 'text-green-600' 
                      : isStepOverdue(step)
                      ? 'text-red-600'
                      : 'text-slate-500'
                  }`}>
                    <div className="flex items-center space-x-1 sm:space-x-2">
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
                    {user && user.role !== 'Client Admin' && user.role !== 'Client Team' && (
                      <button
                        onClick={() => handleEditStepOpen(step)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                      >
                        Edit Deadline
                      </button>
                    )}
                  </div>
                )}
                
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
                            {new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 break-words hyphens-auto overflow-wrap-anywhere word-break-break-word leading-relaxed"
                        style={{ 
                          wordWrap: 'break-word',
                          overflowWrap: 'anywhere',
                          wordBreak: 'break-word',
                          hyphens: 'auto'
                        }}>{comment.text}</p>
                        
                        {/* Show attachment if present */}
                        {comment.attachment_url && (
                          <div className="mt-2 flex items-center space-x-2">
                            <FileText className="w-3 h-3 text-blue-500" />
                            <a
                              href={comment.attachment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                              onClick={() => {
                                console.log('🔗 Clicking attachment link:', comment.attachment_url);
                              }}
                            >
                              View Attachment
                            </a>
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
              {/* Only show Add Step button for Admin users (Super Admin or Team) */}
              {user && (user.role === 'Super Admin' || user.role === 'Team') && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowAddStep(true)}
                    className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl flex items-center space-x-2 hover:bg-green-700 transition-all duration-200 shadow-sm font-medium text-sm sm:text-base self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Add Step</span>
                  </button>
                  <button
                    onClick={handleClearAllSteps}
                    className="bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl flex items-center space-x-2 hover:bg-red-700 transition-all duration-200 shadow-sm font-medium text-sm sm:text-base self-start sm:self-auto"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Clear All Steps</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Debug Section - Only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="px-4 sm:px-8 py-2 sm:py-3 border-b border-slate-200 bg-yellow-50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-yellow-800 font-medium">Debug Mode</span>
                <div className="flex space-x-2">
                  <button
                    onClick={async () => {
                      console.log('🔄 Manual refresh progress steps');
                      await fetchProgressSteps();
                      console.log('✅ Progress steps refreshed');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Refresh Steps
                  </button>
                  <button
                    onClick={() => {
                      console.log('🔍 Current store state:');
                      const storeState = useAppStore.getState();
                      storeState.progressSteps.forEach(step => {
                        if (step.comments && step.comments.length > 0) {
                          console.log(`  Step "${step.title}": ${step.comments.length} comments`);
                        }
                      });
                    }}
                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                  >
                    Check Store
                  </button>
                </div>
              </div>
            </div>
          )}

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
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        console.log('🔄 Manual refresh files');
                        fetchClientFiles(parseInt(clientId));
                      }}
                      className="text-xs text-green-600 hover:text-green-700 font-medium"
                    >
                      Refresh
                    </button>
                    <button
                      onClick={() => {
                        console.log('🗑️ Check state and reload');
                        const { clientFiles } = useAppStore.getState();
                        console.log('🗑️ Current state has', clientFiles.length, 'files');
                        console.log('🗑️ All files in state:', clientFiles);
                        
                        // Force reload by calling fetch
                        fetchClientFiles(parseInt(clientId));
                      }}
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Check State
                    </button>
                    <button
                      onClick={() => setShowFileUpload(true)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Upload
                    </button>
                  </div>
                </div>
                <div className="space-y-2 max-h-24 sm:max-h-32 overflow-y-auto">
                  {attachedFiles.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 min-w-0">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                                          {file.fileUrl ? (
                  <a
                    href={file.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-left w-full block"
                            >
                              <p className="text-xs font-medium text-blue-600 hover:text-blue-800 truncate underline cursor-pointer" title={file.fileName}>{file.fileName}</p>
                            </a>
                          ) : (
                            <p className="text-xs font-medium text-slate-600 truncate" title={file.fileName}>{file.fileName}</p>
                          )}
                          <p className="text-xs text-slate-500">{file.fileSize}</p>
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
                    <LinkIcon className="w-4 h-4" />
                    <span>Links ({websiteLinks.length})</span>
                  </h3>
                  <button
                    onClick={() => setShowAddLink(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Add Link
                  </button>
                </div>
                
                {/* Admin Links Section */}
                {websiteLinks.filter(link => link.link_type === 'admin').length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs font-medium text-blue-700">Admin Links ({websiteLinks.filter(link => link.link_type === 'admin').length})</span>
                    </div>
                    <div className="space-y-2 max-h-20 sm:max-h-24 overflow-y-auto">
                      {websiteLinks.filter(link => link.link_type === 'admin').map(link => (
                        <div key={link.id} className="p-2 bg-blue-50 rounded-lg border border-blue-200 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-blue-700 hover:text-blue-800 truncate block"
                                title={link.title}
                              >
                                {link.title}
                              </a>
                              <p className="text-xs text-blue-500 truncate" title={link.url}>{link.url}</p>
                            </div>
                            {user && (user.role === 'Super Admin' || user.role === 'Team') && (
                              <button
                                onClick={() => handleDeleteLink(link.id)}
                                disabled={isDeletingLink}
                                className="p-1 text-red-500 hover:text-red-700 flex-shrink-0 ml-2 disabled:opacity-50 transition-opacity"
                              >
                                {isDeletingLink ? (
                                  <div className="w-3 h-3 border border-red-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Client Links Section */}
                {websiteLinks.filter(link => link.link_type === 'client').length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-green-700">Client Links ({websiteLinks.filter(link => link.link_type === 'client').length})</span>
                    </div>
                    <div className="space-y-2 max-h-20 sm:max-h-24 overflow-y-auto">
                      {websiteLinks.filter(link => link.link_type === 'client').map(link => (
                        <div key={link.id} className="p-2 bg-green-50 rounded-lg border border-green-200 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-green-700 hover:text-green-800 truncate block"
                                title={link.title}
                              >
                                {link.title}
                              </a>
                              <p className="text-xs text-green-500 truncate" title={link.url}>{link.url}</p>
                            </div>
                            {user && (user.role === 'Client Admin' || user.role === 'Client Team') && (
                              <button
                                onClick={() => handleDeleteLink(link.id)}
                                disabled={isDeletingLink}
                                className="p-1 text-red-500 hover:text-red-700 flex-shrink-0 ml-2 disabled:opacity-50 transition-opacity"
                              >
                                {isDeletingLink ? (
                                  <div className="w-3 h-3 border border-red-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* No Links Message */}
                {websiteLinks.length === 0 && (
                  <p className="text-xs text-slate-500 italic">No links added</p>
                )}
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
              <div className="space-y-6 sm:space-y-8">
                {hierarchicalSteps.map((step) => (
                  <div key={step.id} className="space-y-4">
                    {/* Package/Invoice Container */}
                    {renderProgressStep(step)}
                    
                    {/* Component Steps */}
                    {step.children && step.children.length > 0 && (
                      <div className="ml-4 sm:ml-8 space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-sm font-medium text-blue-700">Components ({step.children.length})</span>
                        </div>
                        {step.children.map((childStep) => 
                          renderProgressStep(childStep, true)
                        )}
                      </div>
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
                {/* Only show Add First Step button for Admin users (Super Admin or Team) */}
                {user && (user.role === 'Super Admin' || user.role === 'Team') && (
                  <button
                    onClick={() => setShowAddStep(true)}
                    className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center space-x-2 hover:bg-green-700 transition-all duration-200 mx-auto font-medium text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Add First Step</span>
                  </button>
                )}
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
                  disabled={isUploadingFile}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="p-6">
                {isUploadingFile ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-slate-600">Uploading files...</p>
                    <p className="text-xs text-slate-500 mt-1">Please wait while your files are being uploaded</p>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    />
                    <p className="text-xs text-slate-500 mt-2">Select one or more files to upload (max 5MB each)</p>
                    <p className="text-xs text-slate-400 mt-1">Supported: JPG, PNG, PDF, DOC, DOCX, XLS, XLSX</p>
                  </>
                )}
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
                    disabled={!newLinkTitle.trim() || !newLinkUrl.trim() || isAddingLink}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                  >
                    {isAddingLink ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <span>Add Link</span>
                    )}
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

                {/* File Attachment Section */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Attachment (Optional)
                  </label>
                  
                  {commentAttachment ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800">{commentAttachment.name}</p>
                          <p className="text-xs text-green-600">
                            {(commentAttachment.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setCommentAttachment(null)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-slate-400 transition-colors">
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert('File size must be less than 5MB');
                              return;
                            }
                            setCommentAttachment(file);
                          }
                        }}
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                        className="hidden"
                        id="comment-attachment"
                      />
                      <label htmlFor="comment-attachment" className="cursor-pointer">
                        <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">
                          Click to attach a file (max 5MB)
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Supports: Images, PDF, DOC, DOCX, XLS, XLSX
                        </p>
                      </label>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => {
                      setShowCommentModal(false);
                    }}
                    className="px-6 py-3 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddComment}
                    disabled={(!newComment.trim() && !commentAttachment) || isAddingComment}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                  >
                    {isAddingComment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{commentAttachment ? 'Uploading...' : 'Adding...'}</span>
                      </>
                    ) : (
                      <span>Add Comment</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deadline Edit Modal */}
        {showDeadlineModal && (
          <div className="fixed inset-0 w-full h-screen bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">
                  Edit {editingDeadlineType === 'onboarding' ? 'Onboarding' : 
                         editingDeadlineType === 'firstDraft' ? 'First Draft' : 
                         editingDeadlineType === 'secondDraft' ? 'Second Draft' : ''} Deadline
                </h3>
                <button
                  onClick={() => {
                    setShowDeadlineModal(false);
                    setEditingDeadlineStepId(null);
                    setEditingDeadlineType(null);
                    setNewDeadlineDate('');
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    New Deadline Date
                  </label>
                  <input
                    type="date"
                    value={newDeadlineDate}
                    onChange={(e) => setNewDeadlineDate(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Select a new deadline date for this milestone
                  </p>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => {
                      setShowDeadlineModal(false);
                      setEditingDeadlineStepId(null);
                      setEditingDeadlineType(null);
                      setNewDeadlineDate('');
                    }}
                    className="px-6 py-3 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDeadline}
                    disabled={!newDeadlineDate || isUpdatingDeadline}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                  >
                    {isUpdatingDeadline ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Update Deadline</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
    </div>
  );
};

export default ClientProgressTracker;