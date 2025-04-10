import React, { useEffect, useState } from "react";
import CardMenu from "../../../../components/card/CardMenu";
import Card from "../../../../components/card";
import reportServices from "../../../../../Services/groupService"; // Create this service
import ReportDetailsModal from "./ReportDetailsModal";

function ReportsTable({ tableData, refreshData }) {
  const [reports, setReports] = useState(tableData);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    setReports(tableData);
  }, [tableData]);

  const handleMarkHandled = async (reportId) => {
    try {
      await reportServices.handleReportMessage(reportId);
      refreshData();
    } catch (error) {
      console.error('Error handling report:', error);
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
        await reportServices.deleteReport(reportId);
        refreshData();
      
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const handleShowDetails = async (reportId) => {
    try {
      setLoadingDetails(true);
      const response = await reportServices.getReportMessageById(reportId);
      setSelectedReport(response);
      setShowDetails(true);
    } catch (error) {
      console.error("Error fetching report details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedReport(null);
  };
  return (
    <Card extra={"w-full h-full sm:overflow-auto px-6"}>
      <header className="relative flex items-center justify-between pt-4">
        <div className="text-xl font-bold text-navy-700 dark:text-white">
          Reports Table
        </div>
        
      </header>

      <div className="mt-8 overflow-x-scroll xl:overflow-x-hidden">
        <table className="w-full">
          <thead>
            <tr className="!border-px !border-gray-400">
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  REPORTER
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  REPORTED USER
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  CONTENT
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  STATUS
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  CREATED AT
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  ACTIONS
                </p>
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, index) => (
              <tr key={index}>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {report.reporter?.username || 'Deleted User'}
                  </p>
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {report.reportedUser?.username || 'Deleted User'}
                  </p>
                </td>
                <td className="min-w-[200px] border-white/0 py-3 pr-4">
                  <p className="text-sm font-bold text-navy-700 dark:text-white truncate max-w-[200px]">
                    {report.content}
                  </p>
                </td>
                <td className="min-w-[100px] border-white/0 py-3 pr-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    report.status === 'handled' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status}
                  </span>
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <div className="flex items-center gap-2">
                   <button
                      className="px-3 py-1 text-sm font-bold text-white bg-blueSecondary rounded hover:bg-blue-900"
                      onClick={() => handleShowDetails(report._id)}
                      disabled={loadingDetails}
                    >
                  
                       {loadingDetails ? 'Loading...' : 'Details'}
                    </button>
                    {report.status === 'in progress' && (
                      <button
                        className="px-3 py-1 text-sm font-bold text-white bg-green-500 rounded hover:bg-green-600"
                        onClick={() => handleMarkHandled(report._id)}
                      >
                        Handle
                      </button>
                    )}
                    <button
                      className="px-3 py-1 text-sm font-bold text-white bg-red-500 rounded hover:bg-red-600"
                      onClick={() => handleDeleteReport(report._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showDetails && (
        <ReportDetailsModal
          report={selectedReport}
          onClose={handleCloseDetails}
        />
      )}
    </Card>
  );
}

export default ReportsTable;