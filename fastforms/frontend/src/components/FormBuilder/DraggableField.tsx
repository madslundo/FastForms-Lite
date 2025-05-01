// DraggableField.tsx
import React from 'react';
import { useDrag } from 'react-dnd';
import { FieldType } from '../../types/formBuilderTypes';

interface DraggableFieldProps {
  field: FieldType;
}

const DraggableField: React.FC<DraggableFieldProps> = ({ field }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'field',
    item: field,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: '8px',
        border: '1px solid #ddd',
        cursor: 'move',
      }}
    >
      {field.label}
    </div>
  );
};

export default DraggableField;
