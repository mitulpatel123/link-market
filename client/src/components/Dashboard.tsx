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

      try {
        // Make sure token is properly formatted
        if (!token.startsWith('Bearer ')) {
          localStorage.setItem('token', `Bearer ${token}`);
        }

        await api.websites.getAll();
        setIsLoading(false);
        fetchData();
      } catch (err: any) {
        console.error('Auth check failed:', {
          message: err.message,
          response: err.response,
          status: err.response?.status
        });
        
        // Clear auth data and redirect on auth errors
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('authenticated');
          localStorage.removeItem('mainPin');
          navigate('/');
        }
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
      {/* Header Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">My Websites</h2>
              <p className="text-blue-100">Manage and organize your website collections</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full md:w-auto px-6 py-3 bg-white text-blue-600 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:bg-blue-50 font-semibold shadow-sm"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add New Website</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search websites..."
              className="pl-10 w-full h-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="h-12 min-w-[200px] rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 px-4"
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
        </div>
      </div>

      {/* Websites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeHeadings.map((heading) => (
          websitesByHeading[heading._id]?.length > 0 && (
            <div 
              key={heading._id} 
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              style={{
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }}
            >
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">{heading.title}</h3>
                  <button
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-all duration-200 
                      bg-white px-3 py-1.5 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transform"
                    onClick={() => {
                      setWebsiteForm({ ...websiteForm, headingId: heading._id });
                      setIsAddModalOpen(true);
                    }}
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {websitesByHeading[heading._id]?.map((website) => (
                  <div
                    key={website._id}
                    className="group p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-white 
                      transition-all duration-300 transform hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <a
                          href={website.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-gray-900 hover:text-blue-600 font-medium truncate 
                            transition-all duration-200 group-hover:translate-x-1 transform"
                          title={website.url}
                        >
                          {website.name}
                        </a>
                      </div>
                      <div className="flex gap-2 ml-4 shrink-0 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => openEditModal(website)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-100 
                            transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 transform"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWebsite(website._id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 
                            transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 transform"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>

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

      {/* Add this CSS to your existing styles */}
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
          
          /* Add smooth scrolling to the whole page */
          html {
            scroll-behavior: smooth;
          }
          
          /* Add a subtle gradient background to the page */
          body {
            background: linear-gradient(to bottom right, #f8fafc, #f1f5f9);
          }
        `}
      </style>
    </Layout>
  );
};

export default Dashboard;
