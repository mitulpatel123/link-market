import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { PlusIcon, PencilIcon, TrashIcon, CalendarIcon, CheckCircleIcon, LockClosedIcon, KeyIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { format } from 'date-fns';
import PinManagement from './PinManagement';
import MainPinManagement from './MainPinManagement';
import DiaryPinManagement from './DiaryPinManagement';

interface DiaryEntry {
  _id: string;
  title: string;
  content: string;
  headingId: {
    _id: string;
    title: string;
  };
  date: string;
  completed: boolean;
}

interface Heading {
  _id: string;
  title: string;
}

const DiaryPage: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<DiaryEntry | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    headingId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [isMainPinModalOpen, setIsMainPinModalOpen] = useState(false);
  const [isDiaryPinModalOpen, setIsDiaryPinModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [entryForm, setEntryForm] = useState({
    title: '',
    content: '',
    headingId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    return () => {
      // Clear diary token when component unmounts
      localStorage.removeItem('diaryToken');
    };
  }, []);

  const fetchData = async () => {
    try {
      const [entriesRes, headingsRes] = await Promise.all([
        api.diary.getAll(),
        api.headings.getAll(),
      ]);
      setEntries(entriesRes.data);
      setHeadings(headingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEntry) {
        await api.diary.update(editingEntry._id, entryForm);
      } else {
        await api.diary.create(entryForm);
      }
      setIsAddModalOpen(false);
      setEditingEntry(null);
      setEntryForm({
        title: '',
        content: '',
        headingId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
      fetchData();
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Error saving entry. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      await api.diary.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Error deleting entry. Please try again.');
    }
  };

  const handleEdit = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setEntryForm({
      title: entry.title,
      content: entry.content,
      headingId: entry.headingId._id,
      date: format(new Date(entry.date), 'yyyy-MM-dd'),
    });
    setIsAddModalOpen(true);
  };

  const handleToggleComplete = async (id: string) => {
    try {
      await api.diary.toggle(id);
      fetchData();
    } catch (error) {
      console.error('Error toggling entry completion:', error);
      alert('Error updating entry. Please try again.');
    }
  };

  const entriesByHeading = entries.reduce((acc, entry) => {
    const headingId = entry.headingId._id;
    if (!acc[headingId]) {
      acc[headingId] = [];
    }
    acc[headingId].push(entry);
    return acc;
  }, {} as Record<string, DiaryEntry[]>);

  // Get only headings that have entries
  const activeHeadings = headings.filter(heading => entriesByHeading[heading._id]);

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingEntry(null);
    setEntryForm({
      title: '',
      content: '',
      headingId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  return (
    <Layout>
      {/* Header Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">My Tasks</h2>
              <p className="text-blue-100">Track and manage your daily tasks and notes</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsMainPinModalOpen(true)}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-700/50 text-white rounded-xl 
                    flex items-center justify-center gap-2 transition-all duration-200 
                    hover:bg-blue-700 font-medium backdrop-blur-sm hover:shadow-lg
                    border border-white/10 group"
                >
                  <LockClosedIcon className="h-4 w-4 text-white/70 group-hover:text-white transition-colors" />
                  <span>Change Main PIN</span>
                </button>
                <button
                  onClick={() => setIsDiaryPinModalOpen(true)}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-700/50 text-white rounded-xl 
                    flex items-center justify-center gap-2 transition-all duration-200 
                    hover:bg-blue-700 font-medium backdrop-blur-sm hover:shadow-lg
                    border border-white/10 group"
                >
                  <KeyIcon className="h-4 w-4 text-white/70 group-hover:text-white transition-colors" />
                  <span>Change Diary PIN</span>
                </button>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full sm:w-auto px-6 py-2.5 bg-white text-blue-600 rounded-xl 
                  flex items-center justify-center gap-2 transition-all duration-200 
                  hover:bg-blue-50 font-semibold shadow-sm hover:shadow-lg"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Entry</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeHeadings.map((heading) => (
          <div 
            key={heading._id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">{heading.title}</h3>
                <button
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-all duration-200 
                    bg-white px-3 py-1.5 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transform"
                  onClick={() => {
                    setEntryForm({ ...entryForm, headingId: heading._id });
                    setIsAddModalOpen(true);
                  }}
                >
                  <PlusIcon className="h-4 w-4" />
                  Add
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {entriesByHeading[heading._id]?.map((entry) => (
                <div
                  key={entry._id}
                  className="group p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-white 
                    transition-all duration-300 transform hover:scale-[1.01]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <button
                          onClick={() => handleToggleComplete(entry._id)}
                          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-colors duration-200
                            ${entry.completed 
                              ? 'border-green-500 bg-green-500 text-white' 
                              : 'border-gray-300 hover:border-blue-500'
                            }`}
                        >
                          {entry.completed && (
                            <CheckCircleIcon className="w-4 h-4" />
                          )}
                        </button>
                        <h4 className={`font-medium truncate ${
                          entry.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}>
                          {entry.title}
                        </h4>
                      </div>
                      {entry.content && entry.content.trim() !== '' && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{entry.content}</p>
                      )}
                      <div className="flex items-center text-xs text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {format(new Date(entry.date), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-100 
                          transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 transform"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry._id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 
                          transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 transform"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {(!entriesByHeading[heading._id] || entriesByHeading[heading._id].length === 0) && (
                <div className="p-4 text-center text-gray-500 text-sm italic">
                  No tasks in this category
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Entry Modal */}
      {(isAddModalOpen || editingEntry) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingEntry ? 'Edit Task' : 'Add New Task'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={entryForm.title}
                  onChange={(e) => setEntryForm({ ...entryForm, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="Enter task title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={entryForm.content}
                  onChange={(e) => setEntryForm({ ...entryForm, content: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="Enter task description (optional)"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={entryForm.date}
                  onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={entryForm.headingId}
                  onChange={(e) => setEntryForm({ ...entryForm, headingId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  required
                >
                  <option value="">Select a category</option>
                  {headings.map((heading) => (
                    <option key={heading._id} value={heading._id}>
                      {heading.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                >
                  {editingEntry ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* PIN Management Modals */}
      <PinManagement
        isOpen={isMainPinModalOpen}
        onClose={() => setIsMainPinModalOpen(false)}
        type="main"
      />
      <PinManagement
        isOpen={isDiaryPinModalOpen}
        onClose={() => setIsDiaryPinModalOpen(false)}
        type="diary"
      />
    </Layout>
  );
};

export default DiaryPage;
