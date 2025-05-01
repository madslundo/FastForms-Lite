import React, { useState, useEffect, useCallback } from "react";
import { useDragLayer } from "react-dnd";
import { FieldType } from "../../types/formBuilderTypes";
import FormField from "./FormField";
import DropSlot from "./DropSlot";
import "./FormBuilder.css";

interface FormBuilderProps {
  fields: (FieldType | null)[][]; // Allow null values
  onFieldAdd: (
    field: FieldType | null,
    rowIndex: number,
    index: number
  ) => void;
  onRowAdd: () => void;
  onFieldDelete: (rowIndex: number, index: number) => void; // Add delete handler
  onFieldUpdate: (updatedField: FieldType, rowIndex: number, index: number) => void; // Add update handler
}

const FormBuilder: React.FC<FormBuilderProps> = ({
  fields,
  onFieldAdd,
  onRowAdd,
  onFieldDelete,
  onFieldUpdate,
}) => {
  const [fieldList, setFields] = useState<(FieldType | null)[][]>([]);

  useEffect(() => {
    if (fields && fields.length > 0) {
      setFields(fields);
    } else {
      setFields([[null]]);
    }
  }, [fields]);


  const handleDrop = (item: FieldType, rowIndex: number, index: number) => {
    const updatedFields = [...fieldList];
  
    // Create a new field with an empty label
    const newField: FieldType = {
      type: item.type,
      label: '', // Set the label to an empty string
      value: '', // Initialize value if needed
      ...(item.type === 'dropdown' && { options: [] }), // Initialize options for dropdowns
    };
  
    updatedFields[rowIndex][index] = newField; // Add the newly created field to the correct index
    setFields(updatedFields); // Update the local state
    onFieldAdd(newField, rowIndex, index); // Notify parent
  };
  

  const handleFieldUpdate = (
    updatedField: FieldType,
    rowIndex: number,
    index: number
  ) => {
    const updatedFields = [...fieldList];
    updatedFields[rowIndex][index] = updatedField;
    setFields(updatedFields);
    onFieldUpdate(updatedField, rowIndex, index);
  };

  const handleFieldDelete = (rowIndex: number, index: number) => {
    const updatedFields = [...fieldList];
    updatedFields[rowIndex][index] = null;
    setFields(updatedFields);
    onFieldDelete(rowIndex, index);
  };

  const handleDropSlotDelete = (rowIndex: number, index: number) => {
    const updatedFields = [...fieldList];
    if (index === 0 && rowIndex === 0) {
      updatedFields.splice(rowIndex, 1);
    } else if (index === 0) {
      updatedFields.splice(rowIndex, 1);
    } else {
      const row = updatedFields[rowIndex];
      row.splice(index, 1);
    }
    setFields(updatedFields);
  };

  const handleRowAdd = () => {
    const newRow: (FieldType | null)[] = [null]; // Start the new row with one empty slot
    setFields([...fieldList, newRow]);
    onRowAdd();
  };

  const handleFieldAdd = (rowIndex: number) => {
    const updatedFields = [...fieldList];
    const row = updatedFields[rowIndex];

    // Add new field only if the row has fewer than 4 fields
    if (row.length < 4) {
      row.push(null); // Add a new empty slot
      setFields(updatedFields); // Update the local state
    }
  };


  const scrollIfNeeded = useCallback((clientY: number) => {
    const scrollThreshold = 100; // Adjust this value for sensitivity
    const scrollAmount = 15; // Speed of scroll
    const viewportHeight = window.innerHeight;

    if (clientY < scrollThreshold) {
      // Scroll up
      window.scrollBy(0, -scrollAmount);
    } else if (clientY > viewportHeight - scrollThreshold) {
      // Scroll down
      window.scrollBy(0, scrollAmount);
    }
  }, []);

  const { isDragging, clientOffset } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    clientOffset: monitor.getClientOffset(),
  }));

  useEffect(() => {
    if (isDragging && clientOffset) {
      scrollIfNeeded(clientOffset.y);
    }
  }, [isDragging, clientOffset, scrollIfNeeded]);

  return (
    <div className="form-builder">
      {fieldList.map((row, rowIndex) => (
        <div className="field-row" key={rowIndex}>
          {/* Flex container for fields */}
          <div className="fields-container">
            {row.map((field, index) => (
              <div className="field-container" key={index}>
                {field && (
                  <FormField
                    field={field}
                    onFieldUpdate={(updatedField) =>
                      handleFieldUpdate(updatedField, rowIndex, index)
                    }
                    onDelete={() => handleFieldDelete(rowIndex, index)}
                  />
                )}
                {field === null && (
                  <DropSlot
                    rowIndex={rowIndex}
                    index={index}
                    onDrop={handleDrop}
                    onDelete={() => handleDropSlotDelete(rowIndex, index)}
                  />
                )}
              </div>
            ))}
          </div>
          {/* Button container for vertical centering */}
          <div className="button-container">
            {row.length < 4 && (
              <button
                onClick={() => handleFieldAdd(rowIndex)}
                className="add-field-button"
                title="Add Field"
              >
                +
              </button>
            )}
          </div>
        </div>
      ))}
      <div className="add-row-button-container">
        <button
          onClick={handleRowAdd}
          className="add-row-button"
          title="Add Row"
        >
          +
        </button>
      </div>
    </div>
  );
  
}
export default FormBuilder;
