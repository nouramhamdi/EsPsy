

import React, { useEffect, useState } from 'react';
import TestService from '../../../../../Services/TestService';
import Card from "../../../../components/card"; // Ajuste le chemin si nécessaire
import { Pencil, Trash2 } from 'lucide-react';

const TableTests = () => {
  const [tests, setTests] = useState([]);
  const [editingTestIndex, setEditingTestIndex] = useState(null);
  const [newTest, setNewTest] = useState({
    title: '',
    description: '',
    category: '',
    duration: 0,
    image: '',
    questions: [],
  });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const data = await TestService.getTests();
      setTests(data);
    } catch (error) {
      console.error('Erreur lors du chargement des tests', error);
    }
  };

  const handleEdit = (index) => {
    setNewTest(tests[index]);
    setEditingTestIndex(index);
  };
  const handleDelete = async (id) => {
    
      await TestService.deleteTest(id);
      fetchTests();
    
  };

  return (
    <Card extra={"w-full h-full sm:overflow-auto px-6"}>
      <header className="flex items-center justify-between pt-4">
        <div className="text-xl font-bold text-navy-700 dark:text-white">
          Tests Table
        </div>
      </header>

      <div className="mt-8 overflow-x-scroll xl:overflow-x-hidden">
        <table className="w-full">
          <thead>
            <tr>
            <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
  <p className="text-sm font-bold text-gray-600 dark:text-white">Photo</p>
</th>

              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">Title</p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">Description</p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">Category</p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">Duration (min)</p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">Actions</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {tests.length > 0 ? (
              tests.map((test) => (
                <tr key={test._id}>
                <td className="border-white/0 py-3 pr-4">
  {test.image ? (
    <img 
      src={test.image.startsWith("http") ? test.image : `http://localhost:5000/public/uploads/${test.image}`}
      alt="Test" 
      className="w-16 h-16 object-cover rounded"
    />
  ) : (
    <p className="text-sm text-gray-500">No Image</p>
  )}
</td>


                  <td className="border-white/0 py-3 pr-4">
                    <p className="text-sm font-bold text-navy-700 dark:text-white">{test.title}</p>
                  </td>
                  <td className="border-white/0 py-3 pr-4">
                    <p className="text-sm text-navy-700 dark:text-white">{test.description}</p>
                  </td>
                  <td className="border-white/0 py-3 pr-4">
                    <p className="text-sm text-navy-700 dark:text-white">{test.category}</p>
                  </td>
                  <td className="border-white/0 py-3 pr-4">
                    <p className="text-sm text-navy-700 dark:text-white">{test.duration}</p>
                  </td>
                  <td className="border-white/0 py-3 pr-4">
                 
                    <div className="space-x-2">
          <button className="btn-sm"><Pencil size={16} /></button>
          <button onClick={() => handleDelete(test._id)} className="btn-sm text-red-500"><Trash2 size={16} /></button>
        </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No tests available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TableTests;
