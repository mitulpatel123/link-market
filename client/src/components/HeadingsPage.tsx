import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

interface Heading {
  _id: string;
  title: string;
  description?: string;
  createdAt: string;
}

const HeadingsPage: React.FC = () => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newHeading, setNewHeading] = useState({ title: '', description: '' });
  const [editingHeading, setEditingHeading] = useState<Heading | null>(null);

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
      await api.headings.create(newHeading);
      setNewHeading({ title: '', description: '' });
      setIsAddModalOpen(false);
      fetchHeadings();
    } catch (error) {
      console.error('Error adding heading:', error);
    }
  };

  const handleEditHeading = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHeading) return;
    try {
      await api.headings.update(editingHeading._id, editingHeading);
      setEditingHeading(null);
      fetchHeadings();
    } catch (error) {
      console.error('Error updating heading:', error);
    }
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

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-jersey text-gray-900">Manage Headings</h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Heading
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {headings.map((heading) => (
          <div key={heading._id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-jersey text-gray-900">{heading.title}</h3>
                {heading.description && (
                  <p className="text-gray-600 mt-1 text-sm">{heading.description}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingHeading(heading)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteHeading(heading._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Heading Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-jersey text-gray-900 mb-4">Add New Heading</h3>
            <form onSubmit={handleAddHeading}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    className="input-field mt-1"
                    value={newHeading.title}
                    onChange={(e) => setNewHeading({ ...newHeading, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="input-field mt-1"
                    value={newHeading.description}
                    onChange={(e) => setNewHeading({ ...newHeading, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Heading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Heading Modal */}
      {editingHeading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-jersey text-gray-900 mb-4">Edit Heading</h3>
            <form onSubmit={handleEditHeading}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    className="input-field mt-1"
                    value={editingHeading.title}
                    onChange={(e) =>
                      setEditingHeading({ ...editingHeading, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="input-field mt-1"
                    value={editingHeading.description || ''}
                    onChange={(e) =>
                      setEditingHeading({ ...editingHeading, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingHeading(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
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
