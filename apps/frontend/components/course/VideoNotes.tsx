'use client';

import { useState } from 'react';
import { BookOpen, Bookmark, Plus, Edit2, Trash2, Save, X, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  useGetVideoNotesQuery,
  useCreateVideoNoteMutation,
  useUpdateVideoNoteMutation,
  useDeleteVideoNoteMutation,
  VideoNote,
} from '@/store/api/courseApi';
import { formatDistanceToNow } from 'date-fns';

interface VideoNotesProps {
  courseId: string;
  videoId: string;
  currentTime: number;
  onNoteClick?: (timestamp: number) => void;
}

export default function VideoNotes({
  courseId,
  videoId,
  currentTime,
  onNoteClick,
}: VideoNotesProps) {
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [isBookmark, setIsBookmark] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');

  const { data, isLoading } = useGetVideoNotesQuery({ courseId, videoId });
  const [createNote] = useCreateVideoNoteMutation();
  const [updateNote] = useUpdateVideoNoteMutation();
  const [deleteNote] = useDeleteVideoNoteMutation();

  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) return;

    try {
      await createNote({
        courseId,
        videoId,
        content: newNoteContent,
        timestamp: currentTime,
        title: newNoteTitle || undefined,
        isBookmark,
      }).unwrap();
      setNewNoteContent('');
      setNewNoteTitle('');
      setIsBookmark(false);
      setShowAddNote(false);
    } catch (error) {
      console.error('Failed to create note', error);
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editContent.trim()) return;

    try {
      await updateNote({
        noteId,
        content: editContent,
        title: editTitle || undefined,
      }).unwrap();
      setEditingNoteId(null);
      setEditContent('');
      setEditTitle('');
    } catch (error) {
      console.error('Failed to update note', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await deleteNote(noteId).unwrap();
    } catch (error) {
      console.error('Failed to delete note', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="text-center text-muted-foreground text-sm sm:text-base">Loading notes...</div>
        </CardContent>
      </Card>
    );
  }

  const notes = data?.notes || [];
  const bookmarks = notes.filter((n) => n.isBookmark);
  const regularNotes = notes.filter((n) => !n.isBookmark);

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">
              Notes ({notes.length})
            </h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddNote(!showAddNote)}
            className="w-full sm:w-auto shrink-0"
          >
            <Plus className="h-4 w-4 mr-1 shrink-0" />
            Add Note
          </Button>
        </div>

        {/* Add Note Form */}
        {showAddNote && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border border-border bg-muted/30 space-y-3">
            <Input
              placeholder="Note title (optional)"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              className="text-sm sm:text-base"
            />
            <textarea
              placeholder="Write your note..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-card px-3 sm:px-4 py-2 text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isBookmark}
                  onChange={(e) => setIsBookmark(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <label className="text-xs sm:text-sm text-foreground flex items-center gap-1">
                  <Bookmark className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Bookmark
                </label>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateNote} disabled={!newNoteContent.trim()} className="flex-1 sm:flex-initial">
                  <Save className="h-4 w-4 mr-1 shrink-0" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowAddNote(false);
                    setNewNoteContent('');
                    setNewNoteTitle('');
                  }}
                >
                  <X className="h-4 w-4 shrink-0" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Note will be saved at {formatTime(currentTime)}
            </p>
          </div>
        )}

        {/* Bookmarks */}
        {bookmarks.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2">
              <Bookmark className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              Bookmarks ({bookmarks.length})
            </h4>
            <div className="space-y-2">
              {bookmarks.map((note) => (
                <div
                  key={note._id}
                  className="p-2.5 sm:p-3 rounded-lg border border-border bg-card hover:bg-accent cursor-pointer"
                  onClick={() => onNoteClick?.(note.timestamp)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {note.title && (
                        <h5 className="font-medium text-foreground mb-1 text-sm sm:text-base truncate">{note.title}</h5>
                      )}
                      <p className="text-xs sm:text-sm text-foreground line-clamp-2">{note.content}</p>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {formatTime(note.timestamp)}
                        </span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-0.5 sm:gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1.5 sm:p-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingNoteId(note._id);
                          setEditContent(note.content);
                          setEditTitle(note.title || '');
                        }}
                      >
                        <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1.5 sm:p-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note._id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Notes */}
        <div>
          <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3">All Notes</h4>
          {regularNotes.length === 0 && bookmarks.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
              No notes yet. Click &quot;Add Note&quot; to get started!
            </div>
          ) : (
            <div className="space-y-2">
              {regularNotes.map((note) => (
                <div
                  key={note._id}
                  className="p-2.5 sm:p-3 rounded-lg border border-border bg-card hover:bg-accent cursor-pointer"
                  onClick={() => onNoteClick?.(note.timestamp)}
                >
                  {editingNoteId === note._id ? (
                    <div className="space-y-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Note title"
                        className="text-sm sm:text-base"
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-border bg-card px-3 sm:px-4 py-2 text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[72px]"
                      />
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" onClick={() => handleUpdateNote(note._id)}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingNoteId(null);
                            setEditContent('');
                            setEditTitle('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {note.title && (
                          <h5 className="font-medium text-foreground mb-1 text-sm sm:text-base truncate">{note.title}</h5>
                        )}
                        <p className="text-xs sm:text-sm text-foreground line-clamp-3">{note.content}</p>
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                            {formatTime(note.timestamp)}
                          </span>
                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-0.5 sm:gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-1.5 sm:p-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNoteId(note._id);
                            setEditContent(note.content);
                            setEditTitle(note.title || '');
                          }}
                        >
                          <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-1.5 sm:p-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note._id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


