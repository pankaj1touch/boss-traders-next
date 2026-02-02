'use client';

import { useState } from 'react';
import { MessageSquare, Heart, Reply, Edit2, Trash2, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  useGetVideoCommentsQuery,
  useCreateVideoCommentMutation,
  useUpdateVideoCommentMutation,
  useDeleteVideoCommentMutation,
  useToggleCommentLikeMutation,
  VideoComment,
} from '@/store/api/courseApi';
import { useAppSelector } from '@/store/hooks';
import { formatDistanceToNow } from 'date-fns';

interface VideoCommentsProps {
  courseId: string;
  videoId: string;
  currentTime?: number;
}

export default function VideoComments({ courseId, videoId, currentTime = 0 }: VideoCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const { data, isLoading } = useGetVideoCommentsQuery({ courseId, videoId });
  const [createComment] = useCreateVideoCommentMutation();
  const [updateComment] = useUpdateVideoCommentMutation();
  const [deleteComment] = useDeleteVideoCommentMutation();
  const [toggleLike] = useToggleCommentLikeMutation();

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      await createComment({
        courseId,
        videoId,
        content: newComment,
        timestamp: currentTime,
      }).unwrap();
      setNewComment('');
    } catch (error) {
      console.error('Failed to create comment', error);
    }
  };

  const handleReply = async (parentCommentId: string) => {
    if (!replyContent.trim() || !isAuthenticated) return;

    try {
      await createComment({
        courseId,
        videoId,
        content: replyContent,
        parentCommentId,
      }).unwrap();
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to create reply', error);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      await updateComment({ commentId, content: editContent }).unwrap();
      setEditingCommentId(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to update comment', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment(commentId).unwrap();
    } catch (error) {
      console.error('Failed to delete comment', error);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!isAuthenticated) return;

    try {
      await toggleLike(commentId).unwrap();
    } catch (error) {
      console.error('Failed to toggle like', error);
    }
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="text-center text-muted-foreground text-sm sm:text-base">Loading comments...</div>
        </CardContent>
      </Card>
    );
  }

  const comments = data?.comments || [];

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">
            Comments ({data?.total || 0})
          </h3>
        </div>

        {/* Add Comment */}
        {isAuthenticated ? (
          <div className="mb-4 sm:mb-6 space-y-2">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="text-sm sm:text-base"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                {currentTime > 0 && `At ${formatTime(currentTime)}`}
              </span>
              <Button size="sm" onClick={handleSubmitComment} disabled={!newComment.trim()} className="w-full sm:w-auto">
                <Send className="h-4 w-4 mr-1 shrink-0" />
                Post
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-muted text-center text-xs sm:text-sm text-muted-foreground">
            Please log in to comment
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-3 sm:space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="border-b border-border pb-3 sm:pb-4 last:border-0">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs sm:text-sm font-medium shrink-0">
                    {comment.userId.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
                      <span className="font-medium text-foreground text-sm sm:text-base">{comment.userId.name}</span>
                      {comment.timestamp && (
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          @ {formatTime(comment.timestamp)}
                        </span>
                      )}
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                      {comment.isEdited && (
                        <span className="text-[10px] sm:text-xs text-muted-foreground italic">(edited)</span>
                      )}
                    </div>

                    {editingCommentId === comment._id ? (
                      <div className="space-y-2">
                        <Input
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          autoFocus
                          className="text-sm sm:text-base"
                        />
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" onClick={() => handleEdit(comment._id)}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditContent('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-foreground mb-2 whitespace-pre-wrap text-sm sm:text-base break-words">{comment.content}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                      <button
                        onClick={() => handleLike(comment._id)}
                        className={`flex items-center gap-1 text-xs sm:text-sm min-h-[32px] ${comment.isLiked ? 'text-red-600' : 'text-muted-foreground'
                          } hover:text-red-600`}
                      >
                        <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 ${comment.isLiked ? 'fill-current' : ''}`} />
                        {comment.likes.length}
                      </button>
                      {isAuthenticated && (
                        <button
                          onClick={() => {
                            setReplyingTo(replyingTo === comment._id ? null : comment._id);
                            setReplyContent('');
                          }}
                          className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground min-h-[32px]"
                        >
                          <Reply className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                          Reply
                        </button>
                      )}
                      {user?.id === comment.userId._id && (
                        <>
                          <button
                            onClick={() => {
                              setEditingCommentId(comment._id);
                              setEditContent(comment.content);
                            }}
                            className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground min-h-[32px]"
                          >
                            <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(comment._id)}
                            className="flex items-center gap-1 text-xs sm:text-sm text-red-600 hover:text-red-700 min-h-[32px]"
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>

                    {/* Reply Input */}
                    {replyingTo === comment._id && (
                      <div className="mt-2 sm:mt-3 space-y-2">
                        <Input
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="text-sm sm:text-base"
                        />
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" onClick={() => handleReply(comment._id)}>
                            Reply
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 sm:mt-4 ml-2 sm:ml-4 space-y-2 sm:space-y-3 border-l-2 border-border pl-3 sm:pl-4">
                        {comment.replies.map((reply) => (
                          <div key={reply._id}>
                            <div className="flex items-start gap-2">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] sm:text-xs shrink-0">
                                {reply.userId.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-0.5">
                                  <span className="text-xs sm:text-sm font-medium text-foreground">
                                    {reply.userId.name}
                                  </span>
                                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm text-foreground break-words">{reply.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {comment.replyCount && comment.replyCount > (comment.replies?.length || 0) && (
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            +{comment.replyCount - (comment.replies?.length || 0)} more replies
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}


