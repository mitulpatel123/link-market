import React, { useState } from 'react';
import api from '../services/api';

interface DiaryPinManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const DiaryPinManagement: React.FC<DiaryPinManagementProps> = ({ isOpen, onClose }) => {
  const [currentDiaryPin, setCurrentDiaryPin] = useState('');
  const [newDiaryPin, setNewDiaryPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate new PIN
    if (newDiaryPin.length !== 6) {
      setError('PIN must be 6 digits');
      setLoading(false);
      return;
    }

    try {
      // Update diary PIN on server
      const response = await api.auth.updateDiaryPin(currentDiaryPin, newDiaryPin);
      
      // Update local storage with new diary token
      localStorage.setItem('diaryToken', response.data.diaryToken);
      localStorage.setItem('diaryPin', newDiaryPin);
      
      setSuccess('Diary PIN updated successfully!');
      
      // Clear form
      setCurrentDiaryPin('');
      setNewDiaryPin('');

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Failed to update diary PIN:', err);
      if (err.response?.status === 401) {
        setError('Current diary PIN is incorrect');
      } else {
        setError('Failed to update PIN. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-jersey text-gray-900">Change Diary PIN</h2>
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
              Current Diary PIN
            </label>
            <input
              type="password"
              value={currentDiaryPin}
              onChange={(e) => {
                setError('');
                setSuccess('');
                setCurrentDiaryPin(e.target.value);
              }}
              className="input-field mt-1"
              placeholder="Enter current diary PIN"
              maxLength={6}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Diary PIN
            </label>
            <input
              type="password"
              value={newDiaryPin}
              onChange={(e) => {
                setError('');
                setSuccess('');
                setNewDiaryPin(e.target.value);
              }}
              className="input-field mt-1"
              placeholder="Enter new diary PIN"
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
              disabled={!currentDiaryPin || !newDiaryPin || loading}
            >
              {loading ? 'Updating...' : 'Update Diary PIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiaryPinManagement;
