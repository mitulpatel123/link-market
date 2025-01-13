import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DiaryAuth: React.FC = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify diary PIN with server
      const response = await api.auth.verifyDiaryPin(pin);
      localStorage.setItem('diaryToken', response.data.diaryToken);
      localStorage.setItem('diaryPin', pin); // Store PIN for future reference
      navigate('/diary');
    } catch (err: any) {
      console.error('Diary auth error:', err);
      if (err.response?.status === 401) {
        setError('Invalid diary PIN');
      } else {
        setError('Authentication failed. Please try again.');
      }
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-jersey text-gray-900">
            Diary Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter Diary PIN to continue
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                setError('');
                setPin(e.target.value);
              }}
              className="input-field text-center text-2xl tracking-widest"
              placeholder="Enter Diary PIN"
              maxLength={6}
              disabled={loading}
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <div>
            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={loading || !pin}
            >
              {loading ? 'Verifying...' : 'Enter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiaryAuth;
