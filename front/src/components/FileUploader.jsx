import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import PropTypes from 'prop-types';

const FileUploader = ({ onFilesChange, maxFiles = 5, accept = 'image/*,video/*,audio/*,.pdf' }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const onDrop = (acceptedFiles, rejectedFiles) => {
    // Gérer les fichiers rejetés
    if (rejectedFiles.length > 0) {
      setError(`Certains fichiers ont été rejetés. Formats acceptés: images, vidéos, audio, PDF.`);
      return;
    }

    // Vérifier le nombre total de fichiers
    if (files.length + acceptedFiles.length > maxFiles) {
      setError(`Vous ne pouvez pas télécharger plus de ${maxFiles} fichiers.`);
      return;
    }

    // Ajouter les nouveaux fichiers à l'état
    const newFiles = [...files, ...acceptedFiles];
    setFiles(newFiles);
    onFilesChange(newFiles);
    setError('');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.avi', '.mov'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
      'application/pdf': ['.pdf']
    },
    maxFiles: maxFiles - files.length
  });

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <i className="fas fa-image text-primary"></i>;
    } else if (file.type.startsWith('video/')) {
      return <i className="fas fa-video text-danger"></i>;
    } else if (file.type.startsWith('audio/')) {
      return <i className="fas fa-music text-success"></i>;
    } else if (file.type === 'application/pdf') {
      return <i className="fas fa-file-pdf text-danger"></i>;
    } else {
      return <i className="fas fa-file text-secondary"></i>;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-uploader">
      <div 
        {...getRootProps()} 
        className={`dropzone p-4 border rounded text-center ${isDragActive ? 'border-primary bg-light' : 'border-secondary'}`}
        style={{ 
          minHeight: '150px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer'
        }}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        <i className="fas fa-cloud-upload-alt fa-3x mb-3 text-primary"></i>
        {isDragActive ? (
          <p>Déposez les fichiers ici...</p>
        ) : (
          <div>
            <p>Glissez-déposez des fichiers ici, ou cliquez pour sélectionner</p>
            <p className="text-muted small">Formats acceptés: images, vidéos, audio, PDF</p>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger mt-2">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-3">
          <h6>Fichiers sélectionnés ({files.length}/{maxFiles})</h6>
          <div className="list-group">
            {files.map((file, index) => (
              <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  {getFileIcon(file)}
                  <span className="ms-2">{file.name}</span>
                  <small className="text-muted ms-2">({formatFileSize(file.size)})</small>
                </div>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removeFile(index)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

FileUploader.propTypes = {
  onFilesChange: PropTypes.func.isRequired,
  maxFiles: PropTypes.number,
  accept: PropTypes.string
};

export default FileUploader; 