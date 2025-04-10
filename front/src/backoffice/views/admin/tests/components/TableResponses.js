import React, { useEffect, useState } from 'react';
import ResponseService from '../../../../../Services/ResponseService'; // Service to fetch responses
import Card from "../../../../components/card"; // Adjust path if necessary
import { Trash2 } from 'lucide-react';

const TableResponses = () => {
  const [responses, setResponses] = useState([]);
  const [results, setResults] = useState({});

  useEffect(() => {
    fetchAllResponses();
  }, []);

  const fetchAllResponses = async () => {
    try {
      const data = await ResponseService.getAllResponses(); // Fetch all responses
      setResponses(data);
    } catch (error) {
      console.error('Error loading responses:', error);
    }
  };

  const handleDeleteResponse = async (id) => {
    try {
      await ResponseService.deleteResponse(id);
      fetchAllResponses();  // Reload the responses after deleting
    } catch (error) {
      console.error('Error deleting response:', error);
    }
  };

  return (
    <Card extra={"w-full h-full sm:overflow-auto px-6"}>
      <header className="flex items-center justify-between pt-4">
        <div className="text-xl font-bold text-navy-700 dark:text-white">
          All Test Responses
        </div>
      </header>

      <div className="mt-8 overflow-x-scroll xl:overflow-x-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">Test Title</p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">User</p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">Answers</p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">Actions</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {responses.length > 0 ? (
              responses.map((response) => (
                <tr key={response._id}>
                  <td className="border-white/0 py-3 pr-4">
                    <p className="text-sm text-navy-700 dark:text-white">
                      {response.testId ? response.testId.title : 'Unknown Test'} {/* Display test title */}
                    </p>
                  </td>
                  <td className="border-white/0 py-3 pr-4">
                    <p className="text-sm text-navy-700 dark:text-white">
                      {response.userId ? response.userId.fullname : 'Unknown User'} {/* Display user name */}
                    </p>
                  </td>
                  <td className="border-white/0 py-3 pr-4">
                    <ul className="list-disc pl-5">
                      {response.answers.map((answer, index) => (
                        <li key={index} className="text-sm text-navy-700 dark:text-white">
                          Question {index + 1}: Selected Option {answer.selectedOption}
                        </li>
                      ))}
                    </ul>
                  </td>
                
                  <td className="border-white/0 py-3 pr-4">
  <div className="space-y-2">
    <textarea
      rows={2}
      placeholder="Enter result..."
      className="w-full p-2 border border-gray-300 rounded"
      value={response.resultText || ''}
      onChange={(e) => {
        const updatedResponses = responses.map((r) =>
          r._id === response._id ? { ...r, resultText: e.target.value } : r
        );
        setResponses(updatedResponses);
      }}
    />
    <button
      onClick={async () => {
        try {
            await ResponseService.addResultToResponse(response._id, response.resultText); // Send the actual result text
            alert("Result sent!");
          fetchAllResponses(); // refresh data
        } catch (err) {
          alert("Error sending result");
          console.error(err);
        }
      }}
      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
    >
      Send Result
    </button>

  
  </div>
</td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No responses available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TableResponses;
