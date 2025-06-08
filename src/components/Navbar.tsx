import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">ChatIt</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Add navigation items here */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 