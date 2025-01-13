import React, { useState } from 'react';
import api from '../services/api';

interface MainPinManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const MainPinManagement: React.FC<MainPinManagementProps> = ({ isOpen, onClose }) => {
  const [newMainPin, setNewMainPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate new PIN
    if (newMainPin.length !== 6) {
      setError('PIN must be 6 digits');
      setLoading(false);
      return;
    }

    try {
      // Update PIN on server first
      const response = await api.auth.updatePin(newMainPin);
      
      // If server update successful, update local storage
      localStorage.setItem('mainPin', newMainPin);
      
      // Update token with new one from response
      localStorage.setItem('token', response.data.token);
      
      setSuccess('Main PIN updated successfully! Please log in again with your new PIN.');
      
      // Clear form
      setNewMainPin('');

      // Close modal and redirect to login after 2 seconds
      setTimeout(() => {
        // Clear all authentication
        localStorage.removeItem('token');
        localStorage.removeItem('authenticated');
        onClose();
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      console.error('Failed to update PIN:', err);
      setError('Failed to update PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-jersey text-gray-900">Change Main PIN</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Main PIN
            </label>
            <input
              type="password"
              value={newMainPin}
              onChange={(e) => {
                setError('');
                setSuccess('');
                setNewMainPin(e.target.value);
              }}
              className="input-field mt-1"
              placeholder="Enter new main PIN"
              maxLength={6}
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          {success && (
            <p className="text-green-500 text-sm">{success}</p>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!newMainPin || loading}
            >
              {loading ? 'Updating...' : 'Update Main PIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MainPinManagement;
