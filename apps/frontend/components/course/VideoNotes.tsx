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
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading notes...</div>
        </CardContent>
      </Card>
    );
  }

  const notes = data?.notes || [];
  const bookmarks = notes.filter((n) => n.isBookmark);
  const regularNotes = notes.filter((n) => !n.isBookmark);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <h3 className="text-lg font-semibold text-foreground">
              Notes ({notes.length})
            </h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddNote(!showAddNote)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Note
          </Button>
        </div>

        {/* Add Note Form */}
        {showAddNote && (
          <div className="mb-6 p-4 rounded-lg border border-border bg-card space-y-3">
            <Input
              placeholder="Note title (optional)"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
            />
            <textarea
              placeholder="Write your note..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isBookmark}
                  onChange={(e) => setIsBookmark(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label className="text-sm text-foreground flex items-center gap-1">
                  <Bookmark className="h-4 w-4" />
                  Bookmark
                </label>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateNote} disabled={!newNoteContent.trim()}>
                  <Save className="h-4 w-4 mr-1" />
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
                  <X className="h-4 w-4" />
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
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Bookmarks ({bookmarks.length})
            </h4>
            <div className="space-y-2">
              {bookmarks.map((note) => (
                <div
                  key={note._id}
                  className="p-3 rounded-lg border border-border bg-card hover:bg-accent cursor-pointer"
                  onClick={() => onNoteClick?.(note.timestamp)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {note.title && (
                        <h5 className="font-medium text-foreground mb-1">{note.title}</h5>
                      )}
                      <p className="text-sm text-foreground line-clamp-2">{note.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(note.timestamp)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingNoteId(note._id);
                          setEditContent(note.content);
                          setEditTitle(note.title || '');
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note._id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
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
          <h4 className="text-sm font-semibold text-foreground mb-3">All Notes</h4>
          {regularNotes.length === 0 && bookmarks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No notes yet. Click "Add Note" to get started!
            </div>
          ) : (
            <div className="space-y-2">
              {regularNotes.map((note) => (
                <div
                  key={note._id}
                  className="p-3 rounded-lg border border-border bg-card hover:bg-accent cursor-pointer"
                  onClick={() => onNoteClick?.(note.timestamp)}
                >
                  {editingNoteId === note._id ? (
                    <div className="space-y-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Note title"
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <div className="flex gap-2">
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
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {note.title && (
                          <h5 className="font-medium text-foreground mb-1">{note.title}</h5>
                        )}
                        <p className="text-sm text-foreground line-clamp-3">{note.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(note.timestamp)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNoteId(note._id);
                            setEditContent(note.content);
                            setEditTitle(note.title || '');
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note._id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
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


