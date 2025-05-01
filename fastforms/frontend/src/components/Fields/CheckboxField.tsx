import React, { useState, useEffect } from "react";
import { FieldType } from "../../types/formBuilderTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "../../styles/Fields/CheckboxField.css";

interface CheckboxFieldProps {
  field: FieldType;
  onFieldUpdate: (updatedField: FieldType) => void;
  onDelete: () => void;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  field,
  onFieldUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [checkboxText, setCheckboxText] = useState(field.checkboxText || "");
  const [labelText, setLabelText] = useState(""); 

  useEffect(() => {
    setCheckboxText(field.checkboxText || "");
    setLabelText(field.label || ""); // Update label when field changes
  }, [field]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFieldUpdate({ ...field, checked: e.target.checked });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCheckboxText(e.target.value);
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabelText(e.target.value);
    onFieldUpdate({ ...field, label: e.target.value }); // Update label in parent component
  };

  const handleBlur = () => {
    setIsEditing(false);
    onFieldUpdate({ ...field, checkboxText }); // Update checkboxText
  };

  return (
    <div className="checkbox-field">
      <input
        type="text"
        value={labelText}
        onChange={handleLabelChange}
        placeholder="Enter description here"
      />
      <div className="checkbox-content">
        <input
          type="checkbox"
          checked={field.checked}
          onChange={handleCheckboxChange}
        />
        {isEditing ? (
          <textarea
            value={checkboxText}
            onChange={handleTextChange}
            onBlur={handleBlur}
            autoFocus
            className="checkbox-textarea"
          />
        ) : (
          <p onClick={() => setIsEditing(true)} className="checkbox-label">
            {checkboxText || "Enter text next to checkbox"}
          </p>
        )}
        <button onClick={onDelete} className="delete-button">
          <FontAwesomeIcon icon={faTrash} color="grey" />
        </button>
      </div>
    </div>
  );
};

export default CheckboxField;
