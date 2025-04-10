import React, { useState, useEffect } from "react";
import ResourceService from "../../../../../Services/ResourceService";
import NotificationCard from "../../../../components/card/NotificationCard";

export default function EditResource({ resource, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
  });
  const [files, setFiles] = useState([]);
  const [currentFiles, setCurrentFiles] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title,
        description: resource.description,
        type: resource.type,
      });
      setCurrentFiles(resource.urifiles || []);
    }
  }, [resource]);

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

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    }

    const description = formData.description.trim();
    if (!description) {
      newErrors.description = "Description is required";
      isValid = false;
    } else if (description.length < 50) {
      newErrors.description = "Description must be at least 50 characters long";
      isValid = false;
    } else if (description.length > 500) {
      newErrors.description = "Description must not exceed 500 characters";
      isValid = false;
    }

    if (!formData.type) {
      newErrors.type = "Type is required";
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
      await ResourceService.updateResource(resource._id, formData, files);
      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Error updating resource";
      setErrors(prev => ({ ...prev, submit: errorMessage }));
    }
  };

  const getFileIcon = (uri) => {
    const ext = uri.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '🖼️';
    if (ext === 'pdf') return '📄';
    if (['mp3', 'wav'].includes(ext)) return '🎵';
    if (['mp4', 'mpeg'].includes(ext)) return '🎥';
    return '📎';
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
      <h4 className="mb-2.5 text-2xl font-bold text-navy-700">
        Edit resource
      </h4>
      <p className="mb-6 text-base text-gray-600">
        Modify the resource details
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="text-sm text-navy-700 font-medium">Title*</label>
          <input
            value={formData.title}
            onChange={handleChange}
            name="title"
            placeholder="Enter the title"
            className="mt-2 w-full rounded-xl border p-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            type="text"
          />
          {errors.title && <span className="text-red-500 text-sm">{errors.title}</span>}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-sm text-navy-700 font-medium">Description*</label>
            <span className={`text-sm ${
              formData.description.length < 50 ? 'text-red-500' : 
              formData.description.length > 500 ? 'text-red-500' : 
              'text-green-500'
            }`}>
              {formData.description.length}/500 characters
            </span>
          </div>
          <textarea
            value={formData.description}
            onChange={handleChange}
            name="description"
            placeholder="Enter the detailed description (minimum 50 characters)"
            className={`mt-2 w-full rounded-xl border p-3 text-sm min-h-[120px] resize-y focus:ring-1 focus:ring-brand-500 ${
              errors.description ? 'border-red-500' : 
              formData.description.length >= 50 && formData.description.length <= 500 ? 'border-green-500' : ''
            }`}
            rows="4"
          />
          {errors.description && (
            <span className="text-red-500 text-sm block">{errors.description}</span>
          )}
          <span className={`text-sm block ${
            formData.description.length < 50 ? 'text-red-500' : 
            formData.description.length > 500 ? 'text-red-500' : 
            'text-green-500'
          }`}>
            {formData.description.length < 50 
              ? `${50 - formData.description.length} more characters needed` 
              : formData.description.length > 500 
              ? `${formData.description.length - 500} characters over limit`
              : 'Valid length'}
          </span>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-navy-700 font-medium">Type*</label>
          <select
            value={formData.type}
            onChange={handleChange}
            name="type"
            className="mt-2 w-full rounded-xl border p-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Select a type</option>
            <option value="meditation">Meditation</option>
            <option value="therapy">Therapy</option>
            <option value="well-being">Well-being</option>
          </select>
          {errors.type && <span className="text-red-500 text-sm">{errors.type}</span>}
        </div>

        <div className="space-y-3">
          <label className="text-sm text-navy-700 font-medium">
            New files (optional)
          </label>
          <div className="relative mt-2">
            <input
              type="file"
              id="files"
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
          </div>
          
          {/* Current files display */}
          {currentFiles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Current files:</p>
              <div className="space-y-2">
                {currentFiles.map((uri, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{getFileIcon(uri)}</span>
                    <span>{uri.split('/').pop()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New selected files display */}
          {files.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">New files to add:</p>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{getFileIcon(file.name)}</span>
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {errors.submit && (
          <div className="text-red-500 text-sm mt-2">{errors.submit}</div>
        )}

        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-brand-500 py-3 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700"
          >
            Update
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
    </div>
  );
}