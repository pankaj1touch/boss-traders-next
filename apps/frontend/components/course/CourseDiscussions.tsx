'use client';

import { useState } from 'react';
import { MessageSquare, Plus, Pin, Lock, CheckCircle, Heart, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  useGetCourseDiscussionsQuery,
  useGetCourseDiscussionQuery,
  useCreateCourseDiscussionMutation,
  useUpdateCourseDiscussionMutation,
  useDeleteCourseDiscussionMutation,
  useAddDiscussionReplyMutation,
  useUpdateDiscussionReplyMutation,
  useDeleteDiscussionReplyMutation,
  useLikeDiscussionMutation,
  useLikeDiscussionReplyMutation,
  useMarkReplyAsSolutionMutation,
  CourseDiscussion,
  DiscussionReply,
} from '@/store/api/courseApi';
import { useAppSelector } from '@/store/hooks';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import Link from 'next/link';

interface CourseDiscussionsProps {
  courseId: string;
}

export default function CourseDiscussionsComponent({ courseId }: CourseDiscussionsProps) {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [category, setCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);

  const { data: discussionsData, isLoading } = useGetCourseDiscussionsQuery({
    courseId,
    category: category || undefined,
    search: search || undefined,
    sort,
    page,
    limit: 10,
  });

  const { data: discussionData, isLoading: isLoadingDiscussion } = useGetCourseDiscussionQuery(
    selectedDiscussionId || '',
    { skip: !selectedDiscussionId }
  );

  const [createDiscussion] = useCreateCourseDiscussionMutation();
  const [updateDiscussion] = useUpdateCourseDiscussionMutation();
  const [deleteDiscussion] = useDeleteCourseDiscussionMutation();
  const [addReply] = useAddDiscussionReplyMutation();
  const [updateReply] = useUpdateDiscussionReplyMutation();
  const [deleteReply] = useDeleteDiscussionReplyMutation();
  const [likeDiscussion] = useLikeDiscussionMutation();
  const [likeReply] = useLikeDiscussionReplyMutation();
  const [markSolution] = useMarkReplyAsSolutionMutation();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general' as 'general' | 'question' | 'help' | 'feedback' | 'announcement',
    tags: '',
  });
  const [replyContent, setReplyContent] = useState('');
  const [editingReplyIndex, setEditingReplyIndex] = useState<number | null>(null);
  const [editingReplyContent, setEditingReplyContent] = useState('');

  const discussions = discussionsData?.discussions || [];
  const selectedDiscussion = discussionData?.discussion;
  const isAdminOrInstructor = user?.roles?.includes('admin') || user?.roles?.includes('instructor');

  const handleCreateDiscussion = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      dispatch(addToast({ type: 'error', message: 'Title and content are required' }));
      return;
    }

    try {
      const result = await createDiscussion({
        courseId,
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
      }).unwrap();
      setFormData({ title: '', content: '', category: 'general', tags: '' });
      setShowCreateForm(false);
      setSelectedDiscussionId(result.discussion._id);
      dispatch(addToast({ type: 'success', message: 'Discussion created successfully' }));
    } catch (error: any) {
      dispatch(
        addToast({
          type: 'error',
          message: error?.data?.message || 'Failed to create discussion',
        })
      );
    }
  };

  const handleDeleteDiscussion = async (discussionId: string) => {
    if (!confirm('Are you sure you want to delete this discussion?')) return;

    try {
      await deleteDiscussion(discussionId).unwrap();
      if (selectedDiscussionId === discussionId) {
        setSelectedDiscussionId(null);
      }
      dispatch(addToast({ type: 'success', message: 'Discussion deleted successfully' }));
    } catch (error: any) {
      dispatch(
        addToast({
          type: 'error',
          message: error?.data?.message || 'Failed to delete discussion',
        })
      );
    }
  };

  const handleAddReply = async () => {
    if (!replyContent.trim() || !selectedDiscussionId) return;

    try {
      await addReply({ discussionId: selectedDiscussionId, content: replyContent }).unwrap();
      setReplyContent('');
      dispatch(addToast({ type: 'success', message: 'Reply added successfully' }));
    } catch (error: any) {
      dispatch(
        addToast({
          type: 'error',
          message: error?.data?.message || 'Failed to add reply',
        })
      );
    }
  };

  const handleUpdateReply = async (replyIndex: number) => {
    if (!editingReplyContent.trim() || !selectedDiscussionId) return;

    try {
      await updateReply({
        discussionId: selectedDiscussionId,
        replyIndex,
        content: editingReplyContent,
      }).unwrap();
      setEditingReplyIndex(null);
      setEditingReplyContent('');
      dispatch(addToast({ type: 'success', message: 'Reply updated successfully' }));
    } catch (error: any) {
      dispatch(
        addToast({
          type: 'error',
          message: error?.data?.message || 'Failed to update reply',
        })
      );
    }
  };

  const handleDeleteReply = async (replyIndex: number) => {
    if (!confirm('Are you sure you want to delete this reply?') || !selectedDiscussionId) return;

    try {
      await deleteReply({ discussionId: selectedDiscussionId, replyIndex }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Reply deleted successfully' }));
    } catch (error: any) {
      dispatch(
        addToast({
          type: 'error',
          message: error?.data?.message || 'Failed to delete reply',
        })
      );
    }
  };

  const handleLikeDiscussion = async (discussionId: string) => {
    try {
      await likeDiscussion(discussionId).unwrap();
    } catch (error: any) {
      dispatch(
        addToast({
          type: 'error',
          message: error?.data?.message || 'Failed to like discussion',
        })
      );
    }
  };

  const handleLikeReply = async (replyIndex: number) => {
    if (!selectedDiscussionId) return;
    try {
      await likeReply({ discussionId: selectedDiscussionId, replyIndex }).unwrap();
    } catch (error: any) {
      dispatch(
        addToast({
          type: 'error',
          message: error?.data?.message || 'Failed to like reply',
        })
      );
    }
  };

  const handleMarkSolution = async (replyIndex: number) => {
    if (!selectedDiscussionId) return;
    try {
      await markSolution({ discussionId: selectedDiscussionId, replyIndex }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Reply marked as solution' }));
    } catch (error: any) {
      dispatch(
        addToast({
          type: 'error',
          message: error?.data?.message || 'Failed to mark as solution',
        })
      );
    }
  };

  if (selectedDiscussion) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setSelectedDiscussionId(null)}>
          ← Back to Discussions
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {selectedDiscussion.isPinned && <Pin className="h-4 w-4 text-primary" />}
                  {selectedDiscussion.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                  {selectedDiscussion.isResolved && <CheckCircle className="h-4 w-4 text-green-500" />}
                  <Badge variant="secondary">{selectedDiscussion.category}</Badge>
                </div>
                <CardTitle>{selectedDiscussion.title}</CardTitle>
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <span>By {selectedDiscussion.userId?.name || 'Unknown'}</span>
                  <span>•</span>
                  <span>{selectedDiscussion.views} views</span>
                  <span>•</span>
                  <span>{new Date(selectedDiscussion.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleLikeDiscussion(selectedDiscussion._id)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <Heart className="h-4 w-4" />
                  <span>{selectedDiscussion.likes}</span>
                </button>
                {(selectedDiscussion.userId?._id === user?.id || isAdminOrInstructor) && (
                  <button
                    onClick={() => handleDeleteDiscussion(selectedDiscussion._id)}
                    className="p-1 hover:bg-destructive/10 rounded transition-colors"
                    title="Delete discussion"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{selectedDiscussion.content}</p>
            </div>

            {selectedDiscussion.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedDiscussion.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">
                Replies ({selectedDiscussion.replies.length})
              </h3>
              <div className="space-y-4">
                {selectedDiscussion.replies.map((reply, idx) => (
                  <div
                    key={reply._id}
                    className={`p-4 rounded-lg border ${reply.isSolution
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                      : 'bg-card border-border'
                      }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {reply.isSolution && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <span className="font-semibold">{reply.userId?.name || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLikeReply(idx)}
                          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-accent transition-colors"
                        >
                          <Heart className="h-3 w-3" />
                          <span className="text-xs">{reply.likes}</span>
                        </button>
                        {(reply.userId?._id === user?.id || isAdminOrInstructor) && (
                          <>
                            <button
                              onClick={() => {
                                setEditingReplyIndex(idx);
                                setEditingReplyContent(reply.content);
                              }}
                              className="p-1 hover:bg-accent rounded transition-colors"
                              title="Edit reply"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteReply(idx)}
                              className="p-1 hover:bg-destructive/10 rounded transition-colors"
                              title="Delete reply"
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </button>
                          </>
                        )}
                        {(isAdminOrInstructor || selectedDiscussion.userId?._id === user?.id) && !reply.isSolution && (
                          <button
                            onClick={() => handleMarkSolution(idx)}
                            className="text-xs px-2 py-1 rounded border border-border hover:bg-accent transition-colors"
                            title="Mark as solution"
                          >
                            Mark Solution
                          </button>
                        )}
                      </div>
                    </div>
                    {editingReplyIndex === idx ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingReplyContent}
                          onChange={(e) => setEditingReplyContent(e.target.value)}
                          rows={3}
                          className="w-full rounded-lg border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateReply(idx)}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingReplyIndex(null);
                              setEditingReplyContent('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{reply.content}</p>
                    )}
                  </div>
                ))}
              </div>

              {!selectedDiscussion.isLocked && isAuthenticated && (
                <div className="mt-4 space-y-2">
                  <textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button onClick={handleAddReply} disabled={!replyContent.trim()}>
                    Post Reply
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Course Discussions
          </CardTitle>
          {isAuthenticated && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? (
                <>
                  <Plus className="h-4 w-4 mr-1 rotate-45" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  New Discussion
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Filters */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search discussions..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
            >
              <option value="">All Categories</option>
              <option value="general">General</option>
              <option value="question">Question</option>
              <option value="help">Help</option>
              <option value="feedback">Feedback</option>
              <option value="announcement">Announcement</option>
            </select>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
            >
              <option value="recent">Recent</option>
              <option value="popular">Popular</option>
              <option value="active">Most Active</option>
            </select>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && isAuthenticated && (
          <div className="mb-6 p-4 rounded-lg border border-border bg-muted/50 space-y-3">
            <Input
              placeholder="Discussion title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <textarea
              placeholder="Discussion content *"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={5}
              className="w-full rounded-lg border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              >
                <option value="general">General</option>
                <option value="question">Question</option>
                <option value="help">Help</option>
                <option value="feedback">Feedback</option>
                <option value="announcement">Announcement</option>
              </select>
              <Input
                placeholder="Tags (comma-separated)"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="flex-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateDiscussion} disabled={!formData.title.trim() || !formData.content.trim()}>
                Create Discussion
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Discussions List */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading discussions...</div>
        ) : discussions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No discussions yet. {isAuthenticated && 'Be the first to start one!'}
          </div>
        ) : (
          <div className="space-y-3">
            {discussions.map((discussion) => (
              <div
                key={discussion._id}
                className="p-4 rounded-lg border border-border bg-card hover:bg-accent/20 transition-colors cursor-pointer"
                onClick={() => setSelectedDiscussionId(discussion._id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {discussion.isPinned && <Pin className="h-4 w-4 text-primary" />}
                      {discussion.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                      {discussion.isResolved && <CheckCircle className="h-4 w-4 text-green-500" />}
                      <Badge variant="secondary">{discussion.category}</Badge>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{discussion.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{discussion.content}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>By {discussion.userId?.name || 'Unknown'}</span>
                      <span>•</span>
                      <span>{discussion.views} views</span>
                      <span>•</span>
                      <span>{discussion.replies.length} replies</span>
                      <span>•</span>
                      <span>{discussion.likes} likes</span>
                      <span>•</span>
                      <span>{new Date(discussion.lastActivity).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {discussionsData && discussionsData.pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {discussionsData.pagination.pages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(discussionsData.pagination.pages, p + 1))}
              disabled={page === discussionsData.pagination.pages}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


