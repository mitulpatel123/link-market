import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import Masonry from 'react-masonry-css';

interface Website {
  _id: string;
  name: string;
  url: string;
  headingId: string;
}

interface Heading {
  _id: string;
  title: string;
}

interface WebsiteForm {
  name: string;
  url: string;
  headingId: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHeading, setSelectedHeading] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentWebsite, setCurrentWebsite] = useState<Website | null>(null);
  const [websiteForm, setWebsiteForm] = useState<WebsiteForm>({
    name: '',
    url: '',
    headingId: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [websitesRes, headingsRes] = await Promise.all([
        api.websites.getAll(),
        api.headings.getAll(),
      ]);
      setWebsites(websitesRes.data);
      setHeadings(headingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const authenticated = localStorage.getItem('authenticated');

      if (!token) {
        navigate('/');
        return;
      }

      // If we have a token but not marked as authenticated, mark as authenticated
      if (!authenticated) {
        localStorage.setItem('authenticated', 'true');
      }

      try {
        await api.websites.getAll();
        setIsLoading(false);
        fetchData();
      } catch (err: any) {
        // Only redirect if token is invalid and we're not authenticated
        if (!authenticated) {
          navigate('/');
        }
        console.error('Auth check failed:', err);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.websites.create(websiteForm);
      setIsAddModalOpen(false);
      setWebsiteForm({ name: '', url: '', headingId: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding website:', error);
      alert('Error adding website. Please try again.');
    }
  };

  const handleEditWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWebsite) return;
    try {
      await api.websites.update(currentWebsite._id, websiteForm);
      setIsEditModalOpen(false);
      setCurrentWebsite(null);
      setWebsiteForm({ name: '', url: '', headingId: '' });
      fetchData();
    } catch (error) {
      console.error('Error updating website:', error);
      alert('Error updating website. Please try again.');
    }
  };

  const handleDeleteWebsite = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this website?')) return;
    try {
      await api.websites.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting website:', error);
      alert('Error deleting website. Please try again.');
    }
  };

  const handleLogout = () => {
    // Clear all auth tokens and state
    localStorage.removeItem('token');
    localStorage.removeItem('authenticated');
    localStorage.removeItem('diaryToken');
    navigate('/');
  };

  const openEditModal = (website: Website) => {
    setCurrentWebsite(website);
    setWebsiteForm({
      name: website.name,
      url: website.url,
      headingId: website.headingId,
    });
    setIsEditModalOpen(true);
  };

  const filteredWebsites = websites.filter((website) => {
    const matchesSearch =
      website.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      website.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHeading = !selectedHeading || website.headingId === selectedHeading;
    return matchesSearch && matchesHeading;
  });

  const websitesByHeading = headings.reduce((acc, heading) => {
    const websitesForHeading = filteredWebsites.filter(
      (website) => website.headingId === heading._id
    );
    if (websitesForHeading.length > 0) {
      acc[heading._id] = websitesForHeading;
    }
    return acc;
  }, {} as Record<string, Website[]>);

  // Get only headings that have websites
  const activeHeadings = headings.filter(heading => websitesByHeading[heading._id]);

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-jersey text-gray-900">Dashboard</h2>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search websites..."
                className="input-field pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="input-field w-full md:w-48"
              value={selectedHeading}
              onChange={(e) => setSelectedHeading(e.target.value)}
            >
              <option value="">All Categories</option>
              {activeHeadings.map((heading) => (
                <option key={heading._id} value={heading._id}>
                  {heading.title}
                </option>
              ))}
            </select>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-primary flex items-center justify-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Website
            </button>
          </div>
        </div>
      </div>

      <style>
        {`
          .my-masonry-grid {
            display: flex;
            width: auto;
            gap: 1.5rem;
          }
          .my-masonry-grid_column {
            background-clip: padding-box;
          }
          .website-card {
            margin-bottom: 1.5rem;
          }
        `}
      </style>

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {activeHeadings.map((heading) => (
          websitesByHeading[heading._id]?.length > 0 && (
            <div key={heading._id} className="website-card bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-jersey text-gray-900">{heading.title}</h3>
                <button
                  className="text-primary hover:text-secondary flex items-center gap-1"
                  onClick={() => {
                    setWebsiteForm({ ...websiteForm, headingId: heading._id });
                    setIsAddModalOpen(true);
                  }}
                >
                  <PlusIcon className="h-5 w-5" />
                  Add Website
                </button>
              </div>
              <div className="space-y-3">
                {websitesByHeading[heading._id]?.map((website) => (
                  <div
                    key={website._id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                  >
                    <a
                      href={website.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate flex-1"
                    >
                      {website.name}
                    </a>
                    <div className="flex space-x-2 ml-2">
                      <button
                        onClick={() => openEditModal(website)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteWebsite(website._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </Masonry>

      {/* Add Website Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-jersey text-gray-900 mb-4">Add New Website</h3>
            <form onSubmit={handleAddWebsite}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Website Name
                  </label>
                  <input
                    type="text"
                    className="input-field mt-1"
                    value={websiteForm.name}
                    onChange={(e) =>
                      setWebsiteForm({ ...websiteForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL</label>
                  <input
                    type="url"
                    className="input-field mt-1"
                    value={websiteForm.url}
                    onChange={(e) =>
                      setWebsiteForm({ ...websiteForm, url: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    className="input-field mt-1"
                    value={websiteForm.headingId}
                    onChange={(e) =>
                      setWebsiteForm({ ...websiteForm, headingId: e.target.value })
                    }
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
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setWebsiteForm({ name: '', url: '', headingId: '' });
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Website
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Website Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-jersey text-gray-900 mb-4">Edit Website</h3>
            <form onSubmit={handleEditWebsite}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Website Name
                  </label>
                  <input
                    type="text"
                    className="input-field mt-1"
                    value={websiteForm.name}
                    onChange={(e) =>
                      setWebsiteForm({ ...websiteForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">URL</label>
                  <input
                    type="url"
                    className="input-field mt-1"
                    value={websiteForm.url}
                    onChange={(e) =>
                      setWebsiteForm({ ...websiteForm, url: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    className="input-field mt-1"
                    value={websiteForm.headingId}
                    onChange={(e) =>
                      setWebsiteForm({ ...websiteForm, headingId: e.target.value })
                    }
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
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setCurrentWebsite(null);
                    setWebsiteForm({ name: '', url: '', headingId: '' });
                  }}
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

export default Dashboard;
