import React, { useState, useEffect } from "react";
import { FieldType } from "../../types/formBuilderTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "../../styles/Fields/FileUploadField.css";

interface FileUploadFieldProps {
  field: FieldType;
  onFieldUpdate: (updatedField: FieldType) => void;
  onDelete: () => void;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  field,
  onFieldUpdate,
  onDelete,
}) => {
  const [label, setLabel] = useState("");
  const [fileName, setFileName] = useState<string | null>(field.value || null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    setLabel(field.label || "");
    setFileName(field.value || null);
    // Clear the preview when the field value changes
    setFilePreview(null);
  }, [field]);

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setLabel(newLabel);
    onFieldUpdate({ ...field, label: newLabel });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFileName(selectedFile.name);
      setFilePreview(URL.createObjectURL(selectedFile)); 
      onFieldUpdate({ ...field, value: selectedFile.name }); 
    }
  };

  const handleDelete = () => {
    setFileName(null);
    setFilePreview(null);
    onFieldUpdate({ ...field, value: "" }); 
    onDelete(); 
  };

  return (
    <div className="file-upload-field">
      <input
        type="text"
        value={label}
        onChange={handleLabelChange}
        placeholder="Enter description here"
      />
      <input
        type="file"
        onChange={handleFileChange}
      />
      {fileName && <p>Uploaded File: {fileName}</p>} {/* Display the name of the uploaded file */}
      {filePreview && <img src={filePreview} alt="File preview" />} {/* Display a preview of the uploaded image if applicable */}
      <button onClick={handleDelete} className="delete-button">
        <FontAwesomeIcon icon={faTrash} color="grey" />
      </button>
    </div>
  );
};

export default FileUploadField;
