import React, { useState, useEffect } from "react"; 
import { FieldType } from "../../types/formBuilderTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "../../styles/Fields/ResponseField.css"; 

interface UserTextFieldProps {
  field: FieldType;
  onFieldUpdate: (updatedField: FieldType) => void;
  onDelete: () => void;
}

const UserTextField: React.FC<UserTextFieldProps> = ({
  field,
  onFieldUpdate,
  onDelete,
}) => {
  const [userInput, setUserInput] = useState(field.value || "");
  const [label, setLabel] = useState(field.label || "");
  // Form creator chooses what type the end-user can fill out the field with 
  const [inputType, setInputType] = useState<"text" | "number" | "email" | "date">(field.inputType || "text");

  useEffect(() => {
    setUserInput(field.value || "");
    setLabel(field.label || "");
    setInputType(field.inputType || "text");
  }, [field]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
    onFieldUpdate({ ...field, value: e.target.value });
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setLabel(newLabel);
    onFieldUpdate({ ...field, label: newLabel });
  };

  const handleInputTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as "text" | "number" | "email" | "date"; 
    setInputType(newType);
    onFieldUpdate({ ...field, inputType: newType });
  };

  return (
    <div className="user-text-field">
      <input
        type="text"
        value={label}
        onChange={handleLabelChange}
        placeholder="Enter description here"
      />
      
      <select
        value={inputType}
        onChange={handleInputTypeChange}
      >
        <option value="text">Text</option>
        <option value="number">Number</option>
        <option value="email">Email</option>
        <option value="date">Date</option>
      </select>

      <input
        type={inputType}
        value={userInput}
        onChange={handleInputChange}
        placeholder="User input"
      />

      <button
        onClick={onDelete}
        className="delete-button"
      >
        <FontAwesomeIcon icon={faTrash} color="grey" />
      </button>
    </div>
  );
};

export default UserTextField;
