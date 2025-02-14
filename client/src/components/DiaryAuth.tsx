import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LockClosedIcon } from '@heroicons/react/24/outline';

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
      const response = await api.auth.verifyDiaryPin(pin);
      localStorage.setItem('diaryToken', response.data.token);
      navigate('/diary');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <LockClosedIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600">
            Please enter your Diary PIN to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <div className="relative">
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setError('');
                  setPin(e.target.value);
                }}
                className="w-full px-4 py-4 text-center text-2xl tracking-[1em] rounded-xl border border-gray-200 
                  focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 
                  disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="••••••"
                disabled={loading}
                required
              />
              <div className="absolute inset-y-0 right-3 flex items-center">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            {error && (
              <div className="mt-2 text-red-500 text-sm flex items-center justify-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              className={`
                w-full py-4 px-6 text-white rounded-xl
                ${loading || !pin 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 transform hover:-translate-y-0.5'
                }
                transition-all duration-200 font-semibold text-lg
                focus:outline-none focus:ring-4 focus:ring-blue-500/50
                shadow-lg hover:shadow-xl
              `}
              disabled={loading || !pin}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : (
                'Enter'
              )}
            </button>
          </div>

          <p className="text-center text-sm text-gray-600">
            Enter your 6-digit PIN to access your diary
          </p>
        </form>
      </div>
    </div>
  );
};

export default DiaryAuth;
