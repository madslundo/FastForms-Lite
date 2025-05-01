import React from 'react';
import CheckboxField from '../Fields/CheckboxField';
import DropdownField from '../Fields/DropdownField';
import StaticTextField from '../Fields/DescriptionLabel'; 
import UserTextField from '../Fields/ResponseField'; 
import SignatureField from '../Fields/SignatureField'; 
import FileField from '../Fields/FileUploadField'; 
import { FieldType } from '../../types/formBuilderTypes';

interface FormFieldProps {
  field: FieldType;
  onFieldUpdate: (updatedField: FieldType) => void;
  onDelete: () => void;
}

const FormField: React.FC<FormFieldProps> = ({ field, onFieldUpdate, onDelete }) => {
  if (!field) return <div>Error: Field is undefined</div>;


  switch (field.type) {
    case 'text':
      return (
        <StaticTextField 
          field={field}
          onFieldUpdate={onFieldUpdate}
          onDelete={onDelete} 
        />
      );
    case 'user-text':
      return (
        <UserTextField 
          field={field} 
          onFieldUpdate={onFieldUpdate} 
          onDelete={onDelete} 
        />
      );
    case 'checkbox':
      return (
        <CheckboxField 
          field={field} 
          onFieldUpdate={onFieldUpdate} 
          onDelete={onDelete} 
        />
      );
    case 'dropdown':
      return (
        <DropdownField 
          field={field} 
          onFieldUpdate={onFieldUpdate} 
          onDelete={onDelete} 
        />
      );
    case 'signature':
      return (
        <SignatureField 
          field={field} 
          onFieldUpdate={onFieldUpdate}
          onDelete={onDelete} 
        />
      );
    case 'file':
      return (
        <FileField 
          field={field} 
          onFieldUpdate={onFieldUpdate}
          onDelete={onDelete} 
        />
      );
    default:
      return null;
  }
};

export default FormField;
