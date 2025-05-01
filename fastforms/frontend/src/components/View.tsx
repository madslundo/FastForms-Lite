import React, { useState } from 'react';
import { FieldType } from '../types/formBuilderTypes';
import '../App.css';
//This is the modal to display what the form looks like

interface ViewProps {
    formElements: FieldType[] | FieldType[][]; // Accept either a 1D or 2D array
    formName: string;
}

const View: React.FC<ViewProps> = ({ formElements, formName }) => {
    // Normalize formElements to be a 2D array
    const normalizedFields = Array.isArray(formElements[0])
        ? formElements as FieldType[][]
        : [formElements as FieldType[]];

    // State to manage open dropdowns
    const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});

    const toggleDropdown = (rowIndex: number, fieldIndex: number) => {
        const key = `${rowIndex}-${fieldIndex}`;
        setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="view-form">
            <h2 className='form-name'>{formName}</h2>
            <div className="form-fields">
                {normalizedFields.map((row, rowIndex) => (
                    <div key={rowIndex} className="form-field-row">
                        {row.map((field, fieldIndex) => (
                            <div key={fieldIndex} className="form-field">
                                <label>{field.label}</label>

                                {/* Render value for checkboxes and other field types */}
                                {field.type === 'checkbox' ? (
                                    <div className="custom-checkbox-container">
                                        <label className="custom-checkbox">
                                            <input type="checkbox" checked={field.checked} disabled />
                                            <span className="checkmark"></span>
                                        </label>
                                        <p style={{ display: 'inline-block', marginLeft: '8px' }}>{field.value}</p>
                                    </div>
                                ) : field.type === 'dropdown' && field.options ? (
                                    <div className="dropdown-container">
                                        <div className="large-box" onClick={() => toggleDropdown(rowIndex, fieldIndex)}>
                                            {field.value || ""}
                                            <span className="arrow">&#9662;</span> {/* Down arrow for indication */}
                                        </div>
                                        {openDropdowns[`${rowIndex}-${fieldIndex}`] && ( // Check if this dropdown is open
                                            <div className="dropdown-options">
                                                {field.options.map((option, optIndex) => (
                                                    <div
                                                        key={optIndex}
                                                        className="dropdown-option"
                                                    >
                                                        {option.value}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : field.type === 'file' ? ( 
                                    <div className="image-container">
                                        {field.value && (
                                            <img 
                                                src={field.value} 
                                                alt={field.label} 
                                                className="uploaded-image" 
                                            />
                                        )}
                                    </div>
                                ) : (
                                    // For other field types, display the value in a paragraph
                                    <p>{field.value}</p>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default View;
