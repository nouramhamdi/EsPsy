import React, { useState } from "react";
import Card from "backoffice/components/card";
import groupService from "../../../../../Services/groupService";
import toast from "react-hot-toast";

const GroupFormCard = ({ onSuccess }) => {
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

  const [formData, setFormData] = useState({
    name: "",
    theme: "",
    creator: loggedUser._id,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let validationErrors = {};

    if (!formData.name) validationErrors.name = "Group name is required";
    if (!formData.theme) validationErrors.theme = "Theme is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await groupService.addGroup(formData);
      onSuccess();
    } catch (error) {
      toast.error("Failed to add group");
      console.error("Error adding group:", error);
    }
  };

  return (
    <Card extra="w-full  max-w-xl mx-auto p-6 bg-white shadow-lg rounded-6xl ">
      <header className="text-center mb-6 ">
        <h5 className="text-xl font-bold text-gray-800">Create Group</h5>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6">
          {/* Group Name */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700">Group Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter group name"
              className="mt-2 p-3 border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
          </div>

          {/* Group Theme */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700">Theme</label>
            <input
              type="text"
              name="theme"
              value={formData.theme}
              onChange={handleChange}
              placeholder="Enter group theme"
              className="mt-2 p-3 border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.theme && <span className="text-red-500 text-sm">{errors.theme}</span>}
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="px-6 py-3 bg-blueSecondary text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create Group
            </button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default GroupFormCard;
