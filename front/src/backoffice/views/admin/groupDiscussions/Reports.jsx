import React, { useEffect, useState } from 'react';
import reportServices from '../../../../Services/groupService';
import ReportsTable from './components/ReportsTable';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchData = async () => {
    try {
      const data = await reportServices.getReportMessageList(filterStatus);
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
  };

  return (
    <div className='mt-8' >
      {/* Filter Controls */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => handleStatusFilter('all')}
          className={`px-4 py-2 rounded ${
            filterStatus === 'all' 
              ? 'bg-blueSecondary text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          All Reports
        </button>
        <button
          onClick={() => handleStatusFilter('in progress')}
          className={`px-4 py-2 rounded ${
            filterStatus === 'in progress' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          In Progress
        </button>
        <button
          onClick={() => handleStatusFilter('handled')}
          className={`px-4 py-2 rounded ${
            filterStatus === 'handled' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Handled
        </button>
      </div>

      <ReportsTable 
        tableData={reports} 
        refreshData={fetchData}
      />
      
    </div>
  );
};

export default Reports;