import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { format } from 'date-fns';
import PinManagement from './PinManagement'; // Import PinManagement component
import MainPinManagement from './MainPinManagement'; // Import MainPinManagement component
import DiaryPinManagement from './DiaryPinManagement'; // Import DiaryPinManagement component

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
      if (currentEntry) {
        await api.diary.update(currentEntry._id, formData);
      } else {
        await api.diary.create(formData);
      }
      setIsModalOpen(false);
      setCurrentEntry(null);
      setFormData({
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
    setCurrentEntry(entry);
    setFormData({
      title: entry.title,
      content: entry.content,
      headingId: entry.headingId._id,
      date: format(new Date(entry.date), 'yyyy-MM-dd'),
    });
    setIsModalOpen(true);
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

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-jersey text-gray-900">My Tasks</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setIsMainPinModalOpen(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              Change Main PIN
            </button>
            <button
              onClick={() => setIsDiaryPinModalOpen(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              Change Diary PIN
            </button>
            <button
              onClick={() => {
                setCurrentEntry(null);
                setFormData({
                  title: '',
                  content: '',
                  headingId: '',
                  date: format(new Date(), 'yyyy-MM-dd'),
                });
                setIsModalOpen(true);
              }}
              className="btn btn-primary flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Entry
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeHeadings.map((heading) => (
          <div key={heading._id} className="card">
            <h3 className="text-xl font-jersey text-gray-900 mb-4">
              {heading.title}
            </h3>
            <div className="space-y-3">
              {entriesByHeading[heading._id]?.map((entry) => (
                <div
                  key={entry._id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={entry.completed}
                      onChange={() => handleToggleComplete(entry._id)}
                      className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <h4
                        className={`font-medium ${
                          entry.completed ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}
                      >
                        {entry.title}
                      </h4>
                      <p
                        className={`text-sm ${
                          entry.completed ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {entry.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(entry.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
              {(!entriesByHeading[heading._id] ||
                entriesByHeading[heading._id].length === 0) && (
                <p className="text-gray-500 text-sm italic">
                  No tasks in this category
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-jersey text-gray-900 mb-4">
              {currentEntry ? 'Edit Task' : 'Add New Task'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Task Title
                  </label>
                  <input
                    type="text"
                    className="input-field mt-1"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    className="input-field mt-1"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    className="input-field mt-1"
                    value={formData.headingId}
                    onChange={(e) =>
                      setFormData({ ...formData, headingId: e.target.value })
                    }
                  >
                    <option value="">Select a category</option>
                    {headings.map((heading) => (
                      <option key={heading._id} value={heading._id}>
                        {heading.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    className="input-field mt-1"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentEntry(null);
                    setFormData({
                      title: '',
                      content: '',
                      headingId: '',
                      date: format(new Date(), 'yyyy-MM-dd'),
                    });
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {currentEntry ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* PIN Management Modals */}
      <MainPinManagement
        isOpen={isMainPinModalOpen}
        onClose={() => setIsMainPinModalOpen(false)}
      />
      <DiaryPinManagement
        isOpen={isDiaryPinModalOpen}
        onClose={() => setIsDiaryPinModalOpen(false)}
      />
    </Layout>
  );
};

export default DiaryPage;
