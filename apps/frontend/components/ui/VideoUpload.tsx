'use client';

import { useState, useRef } from 'react';
import { Upload, X, Video, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { API_BASE_URL } from '@/lib/config';
import { Button } from './Button';

interface VideoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  error?: string;
  disabled?: boolean;
  type?: 'courses';
}

const VideoUpload = ({
  value,
  onChange,
  className = '',
  error,
  disabled = false,
  type = 'courses',
}: VideoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  // Allowed video formats
  const ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime', // MOV
    'video/x-msvideo', // AVI
    'video/x-matroska', // MKV
  ];

  const ALLOWED_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateVideoFile = (file: File): { valid: boolean; error?: string } => {
    // Check file extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return {
        valid: false,
        error: `Invalid file format. Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}`,
      };
    }

    // Check MIME type
    if (!ALLOWED_VIDEO_TYPES.includes(file.type) && !file.type.startsWith('video/')) {
      return {
        valid: false,
        error: `Invalid video type. Allowed types: MP4, WebM, OGG, MOV, AVI, MKV`,
      };
    }

    // Validate file size (500MB limit)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size (${formatFileSize(file.size)}) exceeds maximum limit of 500MB`,
      };
    }

    // Check minimum file size (1MB)
    const minSize = 1 * 1024 * 1024; // 1MB
    if (file.size < minSize) {
      return {
        valid: false,
        error: 'File size is too small. Minimum size is 1MB',
      };
    }

    return { valid: true };
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateVideoFile(file);
    if (!validation.valid) {
      dispatch(addToast({ 
        type: 'error', 
        message: validation.error || 'Invalid video file' 
      }));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setFileInfo({
      name: file.name,
      size: file.size,
      type: file.type,
    });
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', file);

      if (!accessToken) {
        throw new Error('No authentication token found');
      }

      console.log('🚀 Uploading video:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        apiUrl: `${API_BASE_URL}/upload/video`
      });

      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      const response = await new Promise<Response>((resolve, reject) => {
        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setUploadProgress(Math.round(percentComplete));
          }
        });

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const jsonResponse = JSON.parse(xhr.responseText);
              const response = new Response(JSON.stringify(jsonResponse), {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: new Headers({ 'Content-Type': 'application/json' }),
              });
              resolve(response);
            } catch (e) {
              reject(new Error('Invalid response from server'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.message || `Upload failed with status ${xhr.status}`));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network error during upload. Please check your connection.'));
        };

        xhr.ontimeout = () => {
          reject(new Error('Upload timeout. The file might be too large or connection is slow.'));
        };

        xhr.timeout = 300000; // 5 minutes timeout

        xhr.open('POST', `${API_BASE_URL}/upload/video?type=${type}`);
        xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
        xhr.send(formData);
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

      if (result.success && result.videoUrl) {
        onChange(result.videoUrl);
        dispatch(addToast({ 
          type: 'success', 
          message: 'Video uploaded successfully!' 
        }));
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      let errorMessage = 'Failed to upload video';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response) {
        errorMessage = error.response.message || errorMessage;
      }
      
      dispatch(addToast({ 
        type: 'error', 
        message: errorMessage 
      }));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setFileInfo(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveVideo = () => {
    onChange('');
  };

  const handleUploadClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
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
            accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.webm,.ogg,.mov,.avi,.mkv"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading}
          />
          
          <div className="text-center">
            {isUploading ? (
              <>
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-500" />
                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Uploading video...
                </p>
                {fileInfo && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {fileInfo.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {formatFileSize(fileInfo.size)}
                    </p>
                  </div>
                )}
                <div className="mt-4 w-full max-w-xs mx-auto">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                    <div
                      className="h-full bg-primary-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {uploadProgress}% complete
                  </p>
                </div>
              </>
            ) : (
              <>
                <Video className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Click to upload video
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    MP4, WebM, OGG, MOV, AVI, MKV
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Maximum size: 500MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Video Preview */}
        {value && !isUploading && (
          <div className="relative">
            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <video
                src={value}
                className="w-full h-48 object-cover"
                controls
              />
              <button
                type="button"
                onClick={handleRemoveVideo}
                disabled={disabled}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
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
              Video URL
            </label>
            <input
              type="url"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://example.com/video.mp4"
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

export default VideoUpload;





