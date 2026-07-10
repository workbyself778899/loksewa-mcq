'use client';

// Prevent static prerendering for this dynamic notes page
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { FiPlus, FiTrash2, FiX, FiSearch, FiFileText, FiExternalLink, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface NoteType {
  _id: string;
  title: string;
  description: string;
  link?: string;
  createdBy?: { fullName: string; email: string };
  createdAt: string;
}

export default function NotesPage() {
  const { isDark } = useTheme();
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [notes, setNotes] = useState<NoteType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
  });

  // Fetch all notes
  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      } else {
        throw new Error('Failed to load notes');
      }
    } catch (error) {
      console.error('Fetch notes error:', error);
      toast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error('Title and Description are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create note');
      }

      const data = await res.json();
      toast.success('Note added successfully!');
      setNotes([data.note, ...notes]);
      
      // Reset form
      setFormData({ title: '', description: '', link: '' });
      setShowForm(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const res = await fetch(`/api/notes?id=${noteId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete note');
      }

      toast.success('Note deleted!');
      setNotes(notes.filter((n) => n._id !== noteId));
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete note');
    }
  };

  // Filter notes by search query
  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen py-10 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Study Notes</h1>
            <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Browse and access reference notes and links shared by administrators.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowForm(!showForm)}
              className={`px-5 py-2.5 rounded-lg font-bold text-sm text-white shadow-md transition flex items-center gap-2 ${
                showForm
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {showForm ? (
                <>
                  <FiX /> Close Panel
                </>
              ) : (
                <>
                  <FiPlus /> Add Notes Link
                </>
              )}
            </button>
          )}
        </div>

        {/* Note Creation Form (Admin Only) */}
        {isAdmin && showForm && (
          <div className={`p-6 rounded-xl border-2 mb-8 shadow-xl transition-all duration-300 ${
            isDark ? 'bg-gray-900 border-gray-850' : 'bg-white border-gray-200'
          }`}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiFileText className="text-blue-500" /> Create Notes Resource
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-gray-450' : 'text-gray-550'}`}>
                  Notes Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Loksewa G.K. Preparation Guide 2026"
                  className={`w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                    isDark
                      ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-600 focus:border-blue-650'
                      : 'bg-white border-gray-200 text-gray-850 placeholder-gray-400 focus:border-blue-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-gray-450' : 'text-gray-555'}`}>
                  Description / Content
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Summarize what these notes cover..."
                  rows={3}
                  className={`w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition resize-y ${
                    isDark
                      ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-600 focus:border-blue-650'
                      : 'bg-white border-gray-200 text-gray-850 placeholder-gray-400 focus:border-blue-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-gray-450' : 'text-gray-555'}`}>
                  Download/Notes Link (Optional)
                </label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="e.g. https://drive.google.com/... (Google Drive, PDF link)"
                  className={`w-full p-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                    isDark
                      ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-600 focus:border-blue-650'
                      : 'bg-white border-gray-200 text-gray-855 placeholder-gray-400 focus:border-blue-500'
                  }`}
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition disabled:bg-gray-700 disabled:cursor-not-allowed shadow-md"
                >
                  {isSubmitting ? 'Adding...' : 'Add Note Link'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ title: '', description: '', link: '' });
                    setShowForm(false);
                  }}
                  className={`px-6 py-2.5 rounded-lg font-bold text-sm border transition ${
                    isDark ? 'border-gray-800 text-gray-400 hover:bg-gray-850' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search & Statistics Filter Bar */}
        <div className={`p-4 rounded-xl border mb-6 flex flex-col md:flex-row items-center gap-4 ${
          isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        } shadow-sm`}>
          <div className="relative w-full">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-450 w-5 h-5" />
            <input
              type="text"
              placeholder="Search notes by title or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-11 pr-4 py-2.5 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
                isDark
                  ? 'bg-gray-955 border-gray-800 text-white placeholder-gray-600 focus:border-blue-650'
                  : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-500'
              }`}
            />
          </div>
          <div className={`whitespace-nowrap text-xs font-semibold px-4 py-2 rounded-lg ${isDark ? 'bg-gray-950 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
            Showing {filteredNotes.length} resources
          </div>
        </div>

        {/* Notes Grid List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading study notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className={`text-center py-16 rounded-xl border border-dashed ${
            isDark ? 'border-gray-800' : 'border-gray-300'
          }`}>
            <FiFileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-bold mb-1">No Notes Found</h3>
            <p className={`text-sm ${isDark ? 'text-gray-450' : 'text-gray-500'}`}>
              {searchQuery ? 'No search results match your criteria.' : 'Check back later for newly published notes.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredNotes.map((note) => (
              <div
                key={note._id}
                className={`p-6 rounded-xl border shadow-md hover:shadow-lg transition duration-200 flex justify-between gap-4 items-start relative overflow-hidden group ${
                  isDark
                    ? 'bg-gray-900 border-gray-850 hover:border-gray-800 text-white'
                    : 'bg-white border-gray-200 hover:border-gray-300 text-gray-850'
                }`}
              >
                {/* Decorative border line */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-purple-600" />
                
                <div className="flex-1 min-w-0 pl-3">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                    <h3 className="text-xl font-bold leading-snug">{note.title}</h3>
                    {note.link && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/45 text-emerald-800 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900/30">
                        Link Included
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-sm leading-relaxed mb-4 whitespace-pre-wrap ${
                    isDark ? 'text-gray-300' : 'text-gray-650'
                  }`}>
                    {note.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <FiClock className="w-3.5 h-3.5" />
                      {new Date(note.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    {note.createdBy?.fullName && (
                      <span className="flex items-center gap-1">
                        By <span className="font-semibold text-blue-500">{note.createdBy.fullName}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(note._id)}
                      className={`p-2 rounded-lg transition border text-red-500 hover:bg-red-500/5 hover:border-red-500/20`}
                      title="Delete notes link"
                    >
                      <FiTrash2 className="w-4.5 h-4.5" />
                    </button>
                  )}

                  {note.link && (
                    <a
                      href={note.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 sm:px-4 sm:py-2 rounded-lg text-sm font-semibold transition border flex items-center gap-1.5 text-blue-500 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/5`}
                    >
                      <span className="hidden sm:inline">Access Notes</span>
                      <FiExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
