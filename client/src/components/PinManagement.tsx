import React, { useState } from 'react';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

interface PinManagementProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'main' | 'diary';
}

const PinManagement: React.FC<PinManagementProps> = ({ isOpen, onClose, type }) => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPin !== confirmPin) {
      setError('New PINs do not match');
      return;
    }

    if (newPin.length !== 6) {
      setError('PIN must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      if (type === 'main') {
        await api.auth.changeMainPin({ currentPin, newPin });
      } else {
        await api.auth.changeDiaryPin({ currentPin, newPin });
      }
      
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      onClose();
      alert(`${type === 'main' ? 'Main' : 'Diary'} PIN changed successfully`);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error changing PIN');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <LockClosedIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Change {type === 'main' ? 'Main' : 'Diary'} PIN
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current PIN
            </label>
            <input
              type="password"
              maxLength={6}
              value={currentPin}
              onChange={(e) => {
                setError('');
                setCurrentPin(e.target.value);
              }}
              className="w-full px-4 py-3 text-center text-lg tracking-[0.5em] rounded-lg border border-gray-200 
                focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              placeholder="••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New PIN
            </label>
            <input
              type="password"
              maxLength={6}
              value={newPin}
              onChange={(e) => {
                setError('');
                setNewPin(e.target.value);
              }}
              className="w-full px-4 py-3 text-center text-lg tracking-[0.5em] rounded-lg border border-gray-200 
                focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              placeholder="••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New PIN
            </label>
            <input
              type="password"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => {
                setError('');
                setConfirmPin(e.target.value);
              }}
              className="w-full px-4 py-3 text-center text-lg tracking-[0.5em] rounded-lg border border-gray-200 
                focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              placeholder="••••••"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-white rounded-lg transition-all duration-200
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
              `}
            >
              {loading ? 'Changing...' : 'Change PIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PinManagement;
