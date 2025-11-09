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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      dispatch(addToast({ 
        type: 'error', 
        message: 'Please select a valid video file' 
      }));
      return;
    }

    // Validate file size (500MB limit)
    if (file.size > 500 * 1024 * 1024) {
      dispatch(addToast({ 
        type: 'error', 
        message: 'Video size must be less than 500MB' 
      }));
      return;
    }

    setIsUploading(true);

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

      const response = await fetch(`${API_BASE_URL}/upload/video?type=${type}`, {
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
      dispatch(addToast({ 
        type: 'error', 
        message: error.message || 'Failed to upload video' 
      }));
    } finally {
      setIsUploading(false);
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
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading}
          />
          
          <div className="text-center">
            {isUploading ? (
              <>
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-500" />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Uploading video...
                </p>
              </>
            ) : (
              <>
                <Video className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Click to upload video
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    MP4, AVI, MOV up to 500MB
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





