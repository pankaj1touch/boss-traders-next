'use client';

import { useState, useEffect } from 'react';
import { MapPin, Edit2, Trash2, Plus, X, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  useGetVideoAnnotationsQuery,
  useCreateVideoAnnotationMutation,
  useUpdateVideoAnnotationMutation,
  useDeleteVideoAnnotationMutation,
  VideoAnnotation,
} from '@/store/api/courseApi';
import { useAppSelector } from '@/store/hooks';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';

interface VideoAnnotationsProps {
  courseId: string;
  videoId: string;
  currentTime: number;
  onAnnotationClick?: (timestamp: number) => void;
}

export default function VideoAnnotationsComponent({
  courseId,
  videoId,
  currentTime,
  onAnnotationClick,
}: VideoAnnotationsProps) {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useGetVideoAnnotationsQuery({ courseId, videoId });
  const [createAnnotation] = useCreateVideoAnnotationMutation();
  const [updateAnnotation] = useUpdateVideoAnnotationMutation();
  const [deleteAnnotation] = useDeleteVideoAnnotationMutation();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'annotation' as 'marker' | 'annotation' | 'highlight' | 'note',
    title: '',
    content: '',
    color: '#3b82f6',
    isPublic: true,
  });

  const annotations = data?.annotations || [];
  const isAdminOrInstructor = user?.roles?.includes('admin') || user?.roles?.includes('instructor');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      dispatch(addToast({ type: 'error', message: 'Title is required' }));
      return;
    }

    try {
      await createAnnotation({
        courseId,
        videoId,
        timestamp: currentTime,
        ...formData,
      }).unwrap();
      setFormData({
        type: 'annotation',
        title: '',
        content: '',
        color: '#3b82f6',
        isPublic: true,
      });
      setShowAddForm(false);
      dispatch(addToast({ type: 'success', message: 'Annotation created successfully' }));
    } catch (error: any) {
      dispatch(
        addToast({
          type: 'error',
          message: error?.data?.message || 'Failed to create annotation',
        })
      );
    }
  };

  const handleUpdate = async (annotationId: string) => {
    if (!formData.title.trim()) {
      dispatch(addToast({ type: 'error', message: 'Title is required' }));
      return;
    }

    try {
      await updateAnnotation({
        annotationId,
        ...formData,
      }).unwrap();
      setEditingId(null);
      setFormData({
        type: 'annotation',
        title: '',
        content: '',
        color: '#3b82f6',
        isPublic: true,
      });
      dispatch(addToast({ type: 'success', message: 'Annotation updated successfully' }));
    } catch (error: any) {
      dispatch(
        addToast({
          type: 'error',
          message: error?.data?.message || 'Failed to update annotation',
        })
      );
    }
  };

  const handleDelete = async (annotationId: string) => {
    if (!confirm('Are you sure you want to delete this annotation?')) return;

    try {
      await deleteAnnotation(annotationId).unwrap();
      dispatch(addToast({ type: 'success', message: 'Annotation deleted successfully' }));
    } catch (error: any) {
      dispatch(
        addToast({
          type: 'error',
          message: error?.data?.message || 'Failed to delete annotation',
        })
      );
    }
  };

  const startEditing = (annotation: VideoAnnotation) => {
    setEditingId(annotation._id);
    setFormData({
      type: annotation.type,
      title: annotation.title,
      content: annotation.content || '',
      color: annotation.color || '#3b82f6',
      isPublic: annotation.isPublic,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({
      type: 'annotation',
      title: '',
      content: '',
      color: '#3b82f6',
      isPublic: true,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6 text-center text-muted-foreground">
          Loading annotations...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
            Video Annotations
          </CardTitle>
          {isAdminOrInstructor && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAddForm(!showAddForm);
                if (showAddForm) {
                  setFormData({
                    type: 'annotation',
                    title: '',
                    content: '',
                    color: '#3b82f6',
                    isPublic: true,
                  });
                }
              }}
              className="w-full sm:w-auto"
            >
              {showAddForm ? (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Annotation
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {/* Add Annotation Form */}
        {isAdminOrInstructor && showAddForm && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border border-border bg-muted/50 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              >
                <option value="marker">Marker</option>
                <option value="annotation">Annotation</option>
                <option value="highlight">Highlight</option>
                <option value="note">Note</option>
              </select>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full sm:w-12 h-10 rounded border border-border cursor-pointer"
                title="Annotation color"
              />
            </div>
            <Input
              placeholder="Annotation title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="text-sm sm:text-base"
            />
            <textarea
              placeholder="Annotation content (optional)"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-border bg-card px-3 sm:px-4 py-2 text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span>Visible to all students</span>
              </label>
              <div className="text-xs text-muted-foreground">
                Will be added at {formatTime(currentTime)}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button size="sm" onClick={handleCreate} disabled={!formData.title.trim()} className="w-full sm:w-auto">
                Create Annotation
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Annotations List */}
        <div className="space-y-3">
          {annotations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isAdminOrInstructor
                ? 'No annotations yet. Add one to help students!'
                : 'No annotations available for this video'}
            </div>
          ) : (
            annotations.map((annotation) => (
              <div
                key={annotation._id}
                className={`p-4 rounded-lg border transition-colors ${editingId === annotation._id
                  ? 'bg-primary/10 border-primary'
                  : 'bg-card border-border hover:bg-accent/20'
                  }`}
              >
                {editingId === annotation._id ? (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
                      >
                        <option value="marker">Marker</option>
                        <option value="annotation">Annotation</option>
                        <option value="highlight">Highlight</option>
                        <option value="note">Note</option>
                      </select>
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-full sm:w-12 h-10 rounded border border-border cursor-pointer"
                      />
                    </div>
                    <Input
                      placeholder="Title *"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="text-sm sm:text-base"
                    />
                    <textarea
                      placeholder="Content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={2}
                      className="w-full rounded-lg border border-border bg-card px-3 sm:px-4 py-2 text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <Button size="sm" onClick={() => handleUpdate(annotation._id)} className="w-full sm:w-auto">
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditing} className="w-full sm:w-auto">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: annotation.color || '#3b82f6' }}
                          />
                          <Badge variant="secondary" className="text-xs">
                            {annotation.type}
                          </Badge>
                          {!annotation.isPublic && (
                            <Badge variant="secondary" className="text-xs">
                              Private
                            </Badge>
                          )}
                          <button
                            onClick={() => {
                              onAnnotationClick?.(annotation.timestamp);
                            }}
                            className="text-xs text-primary hover:underline"
                          >
                            {formatTime(annotation.timestamp)}
                          </button>
                        </div>
                        <h4 className="font-semibold text-foreground mb-1 break-words">{annotation.title}</h4>
                        {annotation.content && (
                          <p className="text-sm text-muted-foreground mb-2 break-words">{annotation.content}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>By {annotation.createdBy?.name || 'Unknown'}</span>
                          <span>•</span>
                          <span>{new Date(annotation.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {isAdminOrInstructor &&
                        (annotation.createdBy?._id === user?.id || user?.roles?.includes('admin')) && (
                          <div className="flex gap-1 self-start sm:self-auto">
                            <button
                              onClick={() => startEditing(annotation)}
                              className="p-1 hover:bg-accent rounded transition-colors"
                              title="Edit annotation"
                            >
                              <Edit2 className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => handleDelete(annotation._id)}
                              className="p-1 hover:bg-destructive/10 rounded transition-colors"
                              title="Delete annotation"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          </div>
                        )}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}


