import React from "react";
import { useDrop } from "react-dnd";
import { FieldType } from "../../types/formBuilderTypes";

interface DropSlotProps {
  rowIndex: number;
  index: number;
  onDrop: (item: FieldType, rowIndex: number, index: number) => void;
  onDelete: () => void; // Add delete function prop
}

const DropSlot: React.FC<DropSlotProps> = ({
  rowIndex,
  index,
  onDrop,
  onDelete,
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: "field",
    drop: (item: FieldType) => onDrop(item, rowIndex, index),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      style={{
        height: "100%", // Full height of parent div
        border: "2px dashed #6666", // Darker dashed border
        backgroundColor: isOver ? "#f0f0f0" : "#fff",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px",
        transition: "height 0.3s ease", // Smooth height change
      }}
    >
      <span style={{ color: "#999" }}>Drop here</span>
      {/* Trash icon for deletion */}
      <button
        onClick={onDelete}
        style={{
          position: "absolute",
          top: "5px",
          right: "5px",
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        🗑️
      </button>
    </div>
  );
};

export default DropSlot;
