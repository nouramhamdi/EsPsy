import React, { useState } from 'react';
import TableTest from './components/TableTests';
import TableResponses from './components/TableResponses';
import AddTest from './components/AddTest';

const Tests = () => {
  const [currentView, setCurrentView] = useState('list');

  const handleAddTestClick = () => setCurrentView('add');
  const handleBackToList = () => setCurrentView('list');

  return (
    <div className="p-6">
      {currentView === 'list' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold text-gray-800">Tests list</h1>
            <button
              className="flex items-center px-4 py-2.5 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              onClick={handleAddTestClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-white">Add a Test</span>
            </button>
          </div>

          <div className="space-y-6">
            <TableTest />
            <TableResponses />
          </div>
        </>
      )}

      {currentView === 'add' && (
        <div className="relative bg-white p-6 rounded-xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-700">Add a new test</h2>
            <button
              onClick={handleBackToList}
              className="text-sm text-[var(--accent-color)] hover:underline"
            >
              Back to List
            </button>
          </div>
          <AddTest onCancel={handleBackToList} />
        </div>
      )}
    </div>
  );
};

export default Tests;
