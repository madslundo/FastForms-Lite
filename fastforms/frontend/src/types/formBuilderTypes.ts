export interface Option {
  value: string;
  label: string;
}

export interface FieldType {
  type: 'text' | 'user-text' | 'checkbox' | 'dropdown' | 'signature' | 'file';
  label: string;
  options?: Option[]; // For dropdown
  value?: string; // Add value property for storing field value
  checked?: boolean; // For checkbox
  checkboxText?: string; // Text next to checkbox
  data?: Option[]; // Add data property for storing dropdown options
  inputType?: 'text' | 'number' | 'email' | 'date'; // Property for user input type
}




export interface FormBuilderProps {
  fields: FieldType[];
  onFieldAdd: (field: FieldType) => void;
  onRowAdd: () => void;
}

export interface FormFieldProps {
  field: FieldType;
  onFieldUpdate: (updatedField: FieldType) => void; 
  onDelete: () => void; 
}

export interface DragItemType {
  type: FieldType['type'] | null;
  index: number; 
  rowIndex: number; 
}
