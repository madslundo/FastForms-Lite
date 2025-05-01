import React, { useState, useEffect } from "react";
import { FieldType, Option } from "../../types/formBuilderTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "../../styles/Fields/DropdownField.css";

interface DropdownFieldProps {
  field: FieldType;
  onFieldUpdate: (updatedField: FieldType) => void;
  onDelete: () => void;
}

const DropdownField: React.FC<DropdownFieldProps> = ({ field, onFieldUpdate, onDelete }) => {
  const [currentOptions, setCurrentOptions] = useState<Option[]>(field.options || [{ label: '', value: '' }]);
  const [selectedValue, setSelectedValue] = useState<string>(field.value || '');
  const [label, setLabel] = useState("");

  useEffect(() => {
    // Initialize with empty option if no options are provided
    if (!field.options || field.options.length === 0) {
      setCurrentOptions([{ label: '', value: '' }]); // Add an empty option
    } else {
      setCurrentOptions(field.options);
    }
    setSelectedValue(field.value || '');
    setLabel(field.label || "");
  }, [field]);

  const handleOptionChange = (index: number, label: string) => {
    const updatedOptions = currentOptions.map((option, i) =>
      i === index ? { ...option, label, value: label.toLowerCase().replace(/\s+/g, '') } : option
    );
    setCurrentOptions(updatedOptions);
    onFieldUpdate({ ...field, options: updatedOptions, value: selectedValue });
  };

  const handleAddOption = () => {
    const updatedOptions = [...currentOptions, { label: '', value: '' }];
    setCurrentOptions(updatedOptions);
    onFieldUpdate({ ...field, options: updatedOptions, value: selectedValue });
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = currentOptions.filter((_, i) => i !== index);
    setCurrentOptions(updatedOptions);
    onFieldUpdate({ ...field, options: updatedOptions, value: selectedValue });
  };


  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setLabel(newLabel);
    onFieldUpdate({ ...field, label: newLabel }); // Update the field's label
  };

  return (
    <div className="dropdown-field-container" style={{ height: "calc(100% - 15px)"}}>
      <input
        type="text"
        value={label}
        onChange={handleLabelChange}
        style={{ width: "calc(100% - 15px)", marginBottom: "5px", padding: "5px", border: "1px solid #ccc", borderRadius: "4px" }}
        placeholder="Enter description here"
      />
      {currentOptions.map((option, index) => (
        <div key={index} className="option-row">
          <input
            type="text"
            value={option.label}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            placeholder="Add dropdown item"
            className="option-input"
          />
          <button onClick={() => handleRemoveOption(index)} className="remove-option-button">
            X
          </button>
        </div>
      ))}
      <button onClick={handleAddOption} className="add-option-button">
        Add Option
      </button>
      <button onClick={onDelete} className="delete-button">
        <FontAwesomeIcon icon={faTrash} color="grey" />
      </button>
    </div>
  );
};

export default DropdownField;
