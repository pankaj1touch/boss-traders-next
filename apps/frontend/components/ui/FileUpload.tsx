'use client';

import { useState, useRef } from 'react';
import { Upload, X, File, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { API_BASE_URL } from '@/lib/config';
import { Button } from './Button';

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  error?: string;
  disabled?: boolean;
  type?: 'ebooks';
  accept?: string;
}

const FileUpload = ({
  value,
  onChange,
  className = '',
  error,
  disabled = false,
  type = 'ebooks',
  accept = '.pdf,.epub,.mobi,.doc,.docx',
}: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/epub+zip',
      'application/x-mobipocket-ebook',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      dispatch(addToast({ 
        type: 'error', 
        message: 'Please select a valid file (PDF, EPUB, MOBI, DOC, DOCX)' 
      }));
      return;
    }

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      dispatch(addToast({ 
        type: 'error', 
        message: 'File size must be less than 100MB' 
      }));
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      if (!accessToken) {
        throw new Error('No authentication token found');
      }

      console.log('🚀 Uploading file:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        apiUrl: `${API_BASE_URL}/upload/file`
      });

      const response = await fetch(`${API_BASE_URL}/upload/file?type=${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      console.log('📡 Upload response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      if (result.success && result.fileUrl) {
        onChange(result.fileUrl);
        dispatch(addToast({ 
          type: 'success', 
          message: 'File uploaded successfully!' 
        }));
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      dispatch(addToast({ 
        type: 'error', 
        message: error.message || 'Failed to upload file' 
      }));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = () => {
    onChange('');
  };

  const handleUploadClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const getFileIcon = (url: string) => {
    if (url.includes('.pdf')) return '📄';
    if (url.includes('.epub')) return '📚';
    if (url.includes('.mobi')) return '📖';
    if (url.includes('.doc')) return '📝';
    return '📄';
  };

  const getFileName = (url: string) => {
    return url.split('/').pop() || 'Unknown file';
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="space-y-4">
        {/* Upload Area */}
        <div
          onClick={handleUploadClick}
          className={`
            relative border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors
            ${error 
              ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20' 
              : 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/50 hover:border-primary-400 hover:bg-primary-50 dark:hover:border-primary-500 dark:hover:bg-primary-900/20'
            }
            ${disabled || isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading}
          />
          
          <div className="text-center">
            {isUploading ? (
              <>
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-500" />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Uploading file...
                </p>
              </>
            ) : (
              <>
                <File className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Click to upload file
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF, EPUB, MOBI, DOC, DOCX up to 100MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* File Preview */}
        {value && !isUploading && (
          <div className="relative">
            <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getFileIcon(value)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {getFileName(value)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    File uploaded successfully
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={disabled}
                  className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* URL Input Fallback */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            <span>OR</span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              File URL
            </label>
            <input
              type="url"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://example.com/ebook.pdf"
              disabled={disabled}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-primary-400 disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;





