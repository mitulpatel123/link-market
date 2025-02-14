import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

interface Heading {
  _id: string;
  title: string;
  description?: string;
}

const HeadingsPage: React.FC = () => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHeading, setEditingHeading] = useState<Heading | null>(null);
  const [headingForm, setHeadingForm] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchHeadings();
  }, []);

  const fetchHeadings = async () => {
    try {
      const response = await api.headings.getAll();
      setHeadings(response.data);
    } catch (error) {
      console.error('Error fetching headings:', error);
    }
  };

  const handleAddHeading = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.headings.create(headingForm);
      setHeadingForm({ title: '', description: '' });
      setIsAddModalOpen(false);
      fetchHeadings();
    } catch (error) {
      console.error('Error adding heading:', error);
    }
  };

  const handleEditHeading = async () => {
    if (!editingHeading) return;
    try {
      await api.headings.update(editingHeading._id, headingForm);
      setEditingHeading(null);
      setHeadingForm({ title: '', description: '' });
      fetchHeadings();
    } catch (error) {
      console.error('Error updating heading:', error);
    }
  };

  const startEditing = (heading: Heading) => {
    setEditingHeading(heading);
    setHeadingForm({
      title: heading.title,
      description: heading.description || ''
    });
  };

  const handleDeleteHeading = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this heading?')) return;
    try {
      await api.headings.delete(id);
      fetchHeadings();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error deleting heading';
      alert(errorMessage);
      console.error('Error deleting heading:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHeading) {
      await handleEditHeading();
    } else {
      await handleAddHeading(e);
    }
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingHeading(null);
    setHeadingForm({ title: '', description: '' });
  };

  return (
    <Layout>
      {/* Header Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Manage Headings</h2>
              <p className="text-blue-100">Organize your website collections with categories</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full md:w-auto px-6 py-3 bg-white text-blue-600 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:bg-blue-50 font-semibold shadow-sm"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Heading</span>
            </button>
          </div>
        </div>
      </div>

      {/* Headings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {headings.map((heading) => (
          <div 
            key={heading._id} 
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{heading.title}</h3>
                  {heading.description && heading.description.trim() !== '' && (
                    <p className="text-gray-600 text-sm">{heading.description}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => startEditing(heading)}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteHeading(heading._id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Heading Modal */}
      {(isAddModalOpen || editingHeading) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingHeading ? 'Edit Heading' : 'Add New Heading'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={headingForm.title}
                  onChange={(e) => setHeadingForm({ ...headingForm, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="Enter heading title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={headingForm.description}
                  onChange={(e) => setHeadingForm({ ...headingForm, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="Enter heading description"
                  rows={3}
                />
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
                  {editingHeading ? 'Save Changes' : 'Add Heading'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HeadingsPage;
