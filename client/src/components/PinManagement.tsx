import React, { useState } from 'react';

interface PinManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAIN_PIN_KEY = 'mainPin';
const DIARY_PIN_KEY = 'diaryPin';

const PinManagement: React.FC<PinManagementProps> = ({ isOpen, onClose }) => {
  const [mainPin, setMainPin] = useState('');
  const [diaryPin, setDiaryPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Get current diary PIN from localStorage or use default
    const currentDiaryPin = localStorage.getItem(DIARY_PIN_KEY) || '312002';

    // Verify current diary pin
    if (currentPin !== currentDiaryPin) {
      setError('Current PIN is incorrect');
      return;
    }

    // Validate new PINs
    if (mainPin.length !== 6 || diaryPin.length !== 6) {
      setError('PINs must be 6 digits');
      return;
    }

    if (mainPin === diaryPin) {
      setError('Main PIN and Diary PIN cannot be the same');
      return;
    }

    try {
      // Store new PINs in localStorage
      localStorage.setItem(MAIN_PIN_KEY, mainPin);
      localStorage.setItem(DIARY_PIN_KEY, diaryPin);
      
      // Clear all authentication
      localStorage.removeItem('token');
      localStorage.removeItem('diaryToken');
      localStorage.removeItem('authenticated');
      
      setSuccess('PINs updated successfully! Please log in again with your new PIN.');
      
      // Clear form
      setMainPin('');
      setDiaryPin('');
      setCurrentPin('');

      // Close modal and redirect to login after 2 seconds
      setTimeout(() => {
        onClose();
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      setError('Failed to update PINs. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-jersey text-gray-900">Change PINs</h2>
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
              value={currentPin}
              onChange={(e) => {
                setError('');
                setSuccess('');
                setCurrentPin(e.target.value);
              }}
              className="input-field mt-1"
              placeholder="Enter current diary PIN"
              maxLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Main PIN
            </label>
            <input
              type="password"
              value={mainPin}
              onChange={(e) => {
                setError('');
                setSuccess('');
                setMainPin(e.target.value);
              }}
              className="input-field mt-1"
              placeholder="Enter new main PIN"
              maxLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Diary PIN
            </label>
            <input
              type="password"
              value={diaryPin}
              onChange={(e) => {
                setError('');
                setSuccess('');
                setDiaryPin(e.target.value);
              }}
              className="input-field mt-1"
              placeholder="Enter new diary PIN"
              maxLength={6}
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
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Update PINs
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PinManagement;
