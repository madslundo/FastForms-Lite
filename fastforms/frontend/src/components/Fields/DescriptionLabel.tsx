import React, { useState, useEffect } from "react";
import { FieldType } from "../../types/formBuilderTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "../../styles/Fields/DescriptionLabel.css";

interface StaticTextFieldProps {
  field: FieldType;
  onFieldUpdate: (updatedField: FieldType) => void;
  onDelete: () => void;
}

const StaticTextField: React.FC<StaticTextFieldProps> = ({
  field,
  onFieldUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(field.value || "");

  useEffect(() => {
    setText(field.value || "");
  }, [field.value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onFieldUpdate({ ...field, value: text.trim() });
  };

  return (
    <div
      className={`static-text-field ${isEditing ? "editing" : ""}`}
      onClick={() => !isEditing && setIsEditing(true)} // Enable editing on click
    >
      {isEditing ? (
        <textarea
          value={text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          autoFocus
          placeholder="Enter description here"
        />
      ) : (
        <p className={text ? "" : "empty"}>
          {text || "Click to add description"}
        </p>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering edit mode when clicking delete
          onDelete();
        }}
        className="delete-button"
      >
        <FontAwesomeIcon icon={faTrash} color="grey" />
      </button>
    </div>
  );
};

export default StaticTextField;
