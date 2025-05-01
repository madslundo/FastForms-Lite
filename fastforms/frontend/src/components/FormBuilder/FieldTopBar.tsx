import React from 'react';
import './FieldTopBar.css';
import { useDrag } from 'react-dnd';
import { FieldType } from '../../types/formBuilderTypes';

// Define FIELD_TYPES within the component or ensure it's imported correctly
const FIELD_TYPES: FieldType[] = [
  { type: 'text', label: 'Description Label' },
  { type: 'file', label: 'Image Upload' },
  { type: 'user-text', label: 'Response Field', inputType: 'text' },
  { type: 'checkbox', label: 'Checkbox' },
  { type: 'dropdown', label: 'Dropdown', options: [] },
  { type: 'signature', label: 'Signature' },
  { type: 'file', label: 'File Upload Field' },
];

const DraggableField = ({ field }: { field: FieldType }) => {
  const [, drag] = useDrag(() => ({
    type: 'field',
    item: { ...field },
  }));

  return (
    <div ref={drag} className="draggable-field">
      {field.label}
    </div>
  );
};

const FieldTopBar: React.FC = () => {
  return (
    <div className="field-top-bar">
      <div className="field-top-bar-left">
        {FIELD_TYPES.slice(0, 2).map((field: FieldType, index: number) => (
          <DraggableField key={index} field={field} />
        ))}
      </div>

      {/* Divider Line */}
      <div className="field-divider"></div>

      <div className="field-top-bar-right">
        {FIELD_TYPES.slice(2).map((field: FieldType, index: number) => (
          <DraggableField key={index} field={field} />
        ))}
      </div>
    </div>
  );
};

export default FieldTopBar;
