import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X, AlertCircle, CheckCircle, Loader2, FileText } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete: (uploadedFiles: UploadedFile[]) => void;
  multiple?: boolean;
}

interface UploadedFile {
  url: string;
  name: string;
  type: string;
  size: number;
}

interface FileStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  preview?: string;
  url?: string; // Will hold the final URL after upload
  error?: string;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete, multiple = true }) => {
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);
  const [rejections, setRejections] = useState<FileRejection[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    const newFileStatuses: FileStatus[] = acceptedFiles.map(file => ({
      file,
      status: 'pending',
      progress: 0,
      // Create a preview URL for all file types for the download/preview link
      preview: URL.createObjectURL(file), 
    }));
    setFileStatuses(prev => multiple ? [...prev, ...newFileStatuses] : newFileStatuses);
    setRejections(fileRejections);
  }, [multiple]);

  // Clean up preview URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      fileStatuses.forEach(fs => {
        if (fs.preview) {
          URL.revokeObjectURL(fs.preview);
        }
      });
    };
  }, [fileStatuses]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxSize: MAX_SIZE,
  });
  
  const updateFileStatus = (index: number, newStatus: Partial<FileStatus>) => {
    setFileStatuses(prev => {
      const newStatuses = [...prev];
      newStatuses[index] = { ...newStatuses[index], ...newStatus };
      return newStatuses;
    });
  };

  const handleUpload = async () => {
    const uploadedFiles: UploadedFile[] = [];

    for (let i = 0; i < fileStatuses.length; i++) {
      if (fileStatuses[i].status !== 'pending') continue;

      const { file } = fileStatuses[i];
      updateFileStatus(i, { status: 'uploading', progress: 0 });

      try {
        // 1. Get pre-signed URL from our API
        const res = await fetch('/api/generate-upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, fileType: file.type }),
        });

        if (!res.ok) throw new Error('Failed to get upload URL.');

        const { uploadUrl, fileUrl } = await res.json();

        // 2. Upload file to DigitalOcean Spaces
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl, true);
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            updateFileStatus(i, { progress });
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            updateFileStatus(i, { status: 'success', progress: 100, url: fileUrl });
            const uploadedFile = { url: fileUrl, name: file.name, type: file.type, size: file.size };
            uploadedFiles.push(uploadedFile);
            if (uploadedFiles.length === fileStatuses.filter(s => s.status !== 'error').length) {
              onUploadComplete(uploadedFiles);
            }
          } else {
            throw new Error('Upload failed.');
          }
        };

        xhr.onerror = () => {
          throw new Error('Network error during upload.');
        };
        
        xhr.send(file);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        updateFileStatus(i, { status: 'error', error: errorMessage });
      }
    }
  };

  const removeFile = (index: number) => {
    setFileStatuses(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2 text-slate-600">
          <UploadCloud className="w-10 h-10" />
          {isDragActive ? (
            <p className="font-semibold">Drop the files here ...</p>
          ) : (
            <p className="font-semibold">Drag & drop files here, or click to select files</p>
          )}
          <p className="text-sm text-slate-500">Supports JPG, PNG, PDF, DOC, DOCX, XLS, XLSX (max. 5MB)</p>
        </div>
      </div>
      
      {rejections.length > 0 && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          <h4 className="font-semibold flex items-center"><AlertCircle className="w-5 h-5 mr-2" />File Errors:</h4>
          <ul className="list-disc list-inside mt-2 text-sm">
            {rejections.map(({ file, errors }) => (
              <li key={file.name}>
                {file.name} - {errors.map(e => e.message).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {fileStatuses.length > 0 && (
        <div className="space-y-4">
          <ul className="space-y-2">
            {fileStatuses.map((fs, index) => (
              <li key={index} className="flex items-center justify-between p-3 bg-slate-100 rounded-lg border border-slate-200">
                                  <div className="flex items-center space-x-3 flex-grow">
                  {fs.preview && fs.file.type.startsWith('image/') ? (
                    <img src={fs.preview} alt={fs.file.name} className="w-10 h-10 rounded-md object-cover" />
                  ) : fs.file.type === 'application/pdf' ? (
                    <div className="w-10 h-10 bg-red-100 rounded-md flex items-center justify-center">
                      <FileText className="w-6 h-6 text-red-600" />
                    </div>
                  ) : fs.file.type.includes('document') || fs.file.type.includes('docx') || fs.file.type.includes('doc') ? (
                    <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                  ) : fs.file.type.includes('spreadsheet') || fs.file.type.includes('excel') ? (
                    <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                  ) : (
                    <FileIcon className="w-10 h-10 text-slate-500 flex-shrink-0" />
                  )}
                  <div className="flex-grow overflow-hidden">
                    <span className="text-sm font-medium text-slate-700 truncate block">{fs.file.name}</span>
                    {fs.file.type === 'application/pdf' && (fs.status === 'success' || fs.status === 'pending') && (
                      <a
                        href={fs.url || fs.preview}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Download / Preview PDF
                      </a>
                    )}
                    <div className="text-xs text-slate-500">
                      {(fs.file.size / 1024).toFixed(2)} KB
                      {fs.status === 'error' && <span className="text-red-600 ml-2"> - {fs.error}</span>}
                    </div>
                  </div>
                  {fs.status === 'uploading' && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
                  {fs.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {fs.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                </div>
                {fs.status === 'uploading' ? (
                  <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden mx-4">
                    <div className="h-full bg-blue-500" style={{ width: `${fs.progress}%` }} />
                  </div>
                ) : (
                  <button onClick={() => removeFile(index)} className="p-1 text-slate-500 hover:text-red-600 rounded-full"><X className="w-4 h-4" /></button>
                )}
              </li>
            ))}
          </ul>
          <button
            onClick={handleUpload}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 font-semibold"
            disabled={fileStatuses.every(fs => fs.status !== 'pending')}
          >
            Upload {fileStatuses.filter(fs => fs.status === 'pending').length} File(s)
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 