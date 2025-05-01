import React, { useState, useEffect } from "react";
import { FieldType } from "../../types/formBuilderTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "../../styles/Fields/SignatureField.css";

interface SignatureFieldProps {
  field: FieldType;
  onFieldUpdate: (updatedField: FieldType) => void;
  onDelete: () => void;
}

const SignatureField: React.FC<SignatureFieldProps> = ({
  field,
  onFieldUpdate,
  onDelete,
}) => {
  const [label, setLabel] = useState("");

  useEffect(() => {
    setLabel(field.label || "");
  }, [field]);

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setLabel(newLabel);
    onFieldUpdate({ ...field, label: newLabel });
  };

  return (
    <div className="signature-field">
      <input
        type="text"
        value={label}
        onChange={handleLabelChange}
        placeholder="Enter description here"
      />
      <div className="signature-area">
        <p>Signature Area</p>
        {/* Implement signature pad here */}
      </div>
      <button onClick={onDelete} className="delete-button">
        <FontAwesomeIcon icon={faTrash} color="grey" />
      </button>
    </div>
  );
};

export default SignatureField;
