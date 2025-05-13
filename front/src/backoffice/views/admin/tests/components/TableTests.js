import React, { useEffect, useState } from 'react';
import TestService from '../../../../../Services/TestService';
import Card from "../../../../components/card";
import { Pencil, Trash2 } from 'lucide-react';

const categories = [
  "Cognitive and Intelligence Tests",
  "Personality Tests",
  "Neuropsychological Tests",
  "Achievement and Educational Tests",
  "Diagnostic and Clinical Tests",
  "Projective Tests",
  "Behavioral and Observational Tests",
  "Attitude and Opinion Tests",
  "Vocational and Career Tests",
  "Social and Emotional Intelligence Tests",
  "Stress and Coping Tests",
  "Memory and Attention Tests"
];

const TableTests = () => {
  const [tests, setTests] = useState([]);
  const [editingTestIndex, setEditingTestIndex] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTitle, setSearchTitle] = useState('');

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

  const handleEdit = (id) => {
    const index = tests.findIndex((test) => test._id === id);
    setNewTest(tests[index]);
    setEditingTestIndex(index);
  };
  
  const handleDelete = async (id) => {
    
      await TestService.deleteTest(id);
      fetchTests();
    
  };

  const filteredTests = tests.filter(test => {
    const matchesCategory = filterCategory ? test.category === filterCategory : true;
    const matchesSearch = test.title.toLowerCase().includes(searchTitle.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Card extra={"w-full h-full sm:overflow-auto px-6"}>
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between pt-4">
        <div className="text-xl font-bold text-navy-700 dark:text-white">Tests Table</div>

        <div className="flex flex-wrap gap-2">
       

          <input
            type="text"
            placeholder="Search by title..."
            className="border border-gray-300 rounded p-2 text-sm"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
          />
             <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded p-2 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="mt-8 overflow-x-scroll xl:overflow-x-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">Photo</th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">Title</th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">Description</th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">Category</th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">Duration (min)</th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTests.length > 0 ? (
              filteredTests.map((test) => (
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
                  <td className="border-white/0 py-3 pr-4 flex gap-2">
                  <button onClick={() => handleEdit(test._id)} className="btn-sm"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(test._id)} className="btn-sm text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">No tests available</td>
              </tr>
            )}
          </tbody>
        </table>
        {editingTestIndex !== null && (
  <div className="mt-6 p-4 border rounded bg-gray-50 dark:bg-gray-800">
    <h3 className="text-lg font-semibold mb-4 text-navy-700 dark:text-white">Edit Test</h3>
    
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await TestService.updateTest(tests[editingTestIndex]._id, newTest);
          setEditingTestIndex(null);
          setNewTest({ title: '', description: '', category: '', duration: 0, image: '', questions: [] });
          fetchTests();
        } catch (err) {
          alert("Error updating test");
          console.error(err);
        }
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Title"
          value={newTest.title}
          onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={newTest.description}
          onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
          className="p-2 border rounded"
          required
        />
        <select
          value={newTest.category}
          onChange={(e) => setNewTest({ ...newTest, category: e.target.value })}
          className="p-2 border rounded"
          required
        >
          <option value="">Select Category</option>
          {[
            "Cognitive and Intelligence Tests",
            "Personality Tests",
            "Neuropsychological Tests",
            "Achievement and Educational Tests",
            "Diagnostic and Clinical Tests",
            "Projective Tests",
            "Behavioral and Observational Tests",
            "Attitude and Opinion Tests",
            "Vocational and Career Tests",
            "Social and Emotional Intelligence Tests",
            "Stress and Coping Tests",
            "Memory and Attention Tests"
          ].map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Duration (min)"
          value={newTest.duration}
          onChange={(e) => setNewTest({ ...newTest, duration: Number(e.target.value) })}
          className="p-2 border rounded"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setNewTest({ ...newTest, image: e.target.files[0] })
          }
          className="p-2 border rounded"
        />
      </div>
      <div className="mt-4 flex gap-4">
        <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] text-white rounded">
          Save
        </button>
        <button
          type="button"
          onClick={() => {
            setEditingTestIndex(null);
            setNewTest({ title: '', description: '', category: '', duration: 0, image: '', questions: [] });
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
)}
      </div>
    </Card>
  );
};

export default TableTests;
