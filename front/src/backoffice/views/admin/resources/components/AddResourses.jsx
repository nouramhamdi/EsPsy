import React, { useState } from "react";
import InputField from "../../../../components/fields/InputField";
import ResourceService from "../../../../../Services/ResourceService";
import NotificationCard from "../../../../components/card/NotificationCard";

export default function AddResource({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "meditation",
  });

  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    files: "",
    type: ""
  });

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '🖼️';
    if (ext === 'pdf') return '📄';
    if (['mp3', 'wav'].includes(ext)) return '🎵';
    if (['mp4', 'mpeg'].includes(ext)) return '🎥';
    return '📎';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      setErrors({ ...errors, files: "" });
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = "Le titre est requis";
      isValid = false;
    }

    const description = formData.description.trim();
    if (!description) {
      newErrors.description = "Description is required";
      isValid = false;
    } else if (description.length < 50) {
      newErrors.description = "Description must be at least 50 characters";
      isValid = false;
    } else if (description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters";
      isValid = false;
    }

    if (!formData.type) {
      newErrors.type = "Type is required";
      isValid = false;
    }

    if (files.length === 0) {
      newErrors.files = "At least one file is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      await ResourceService.addResource(formData, files);
      showNotification("Resource added successfully!", "success");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      showNotification(
        error.response?.data?.error || "Error adding resource",
        "error"
      );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h4 className="mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
        Add resource
      </h4>
      <p className="mb-9 text-base text-gray-600">
      Enter the details of the new resource

      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          value={formData.title}
          onChange={handleChange}
          variant="auth"
          label="Titre*"
          placeholder="Entre the title"
          id="title"
          name="title"
          type="text"
        />
        {errors.title && <span className="text-red-500 text-sm">{errors.title}</span>}

        <div className="space-y-1">
          <label className="text-sm text-navy-700 dark:text-white font-medium">Description*</label>
          <textarea
            value={formData.description}
            onChange={handleChange}
            name="description"
            placeholder="Enter the detailed description (minimum 50 characters)"

            className="mt-2 w-full rounded-xl border p-3 text-sm min-h-[120px] resize-y"
            rows="4"
          />
          {errors.description && <span className="text-red-500 text-sm">{errors.description}</span>}
          <span className="text-sm text-gray-500">
            {formData.description.length}/500 characters

          </span>
        </div>

        <div>
          <label className="text-sm text-navy-700 dark:text-white font-medium">Type*</label>
          <select
            value={formData.type}
            onChange={handleChange}
            name="type"
            className="mt-2 w-full rounded-xl border p-3 text-sm"
          >
            <option value="meditation">Meditation</option>
            <option value="therapy">Therapy</option>
            <option value="well-being">Well-being</option>
          </select>
          {errors.type && <span className="text-red-500 text-sm">{errors.type}</span>}
        </div>

        <div>
          <label className="text-sm text-navy-700 dark:text-white font-medium">
            Files*
          </label>
          <div className="relative mt-2">
            <input
              type="file"
              id="files"
              name="files"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.mp3,.mp4,.wav,.jpg,.jpeg,.png,.gif"
              multiple
            />
            <label
              htmlFor="files"
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Select files
            </label>
            <div className="mt-2 text-sm text-gray-500">
              {files.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {Array.from(files).map((file, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span>{getFileIcon(file.name)}</span>
                      <span>{file.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center">No files chosen</p>
              )}
            </div>
          </div>
          {errors.files && <span className="text-red-500 text-sm">{errors.files}</span>}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-brand-500 py-3 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700"
          >
            Add
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl bg-gray-500 py-3 text-base font-medium text-white transition duration-200 hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>

      {notification.show && (
        <NotificationCard
          message={notification.message}
          type={notification.type}
          show={notification.show}
        />
      )}
    </div>
  );
}