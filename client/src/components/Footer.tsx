import React from 'react';
import { HeartIcon } from '@heroicons/react/24/solid';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex items-center gap-2 text-gray-600">
            <span>Made with</span>
            <HeartIcon className="w-5 h-5 text-red-500 animate-pulse" />
            <span>by</span>
            <a 
              href="https://github.com/yourusername" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Mitul Patel
            </a>
          </div>
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Link Market. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 