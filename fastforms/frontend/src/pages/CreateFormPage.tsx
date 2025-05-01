import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FieldTopBar from "../components/FormBuilder/FieldTopBar";
import FormBuilder from "../components/FormBuilder/FormBuilder";
import { FieldType } from "../types/formBuilderTypes";
import "./CreateFormPage.css";
import axios from "axios";

const CreateFormPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [fieldList, setFieldList] = useState<(FieldType | null)[][]>([[null]]); // Start with one empty drop slot for intuity
  const [formName, setFormName] = useState("");
  const [formDates] = useState({ startDate: "", endDate: "" });
  const [createdDate, setCreatedDate] = useState<string | undefined>(undefined);
  const [formStatus, setFormStatus] = useState("");
  const [formUsageCount, setFormUsageCount] = useState(0);
  const [formVersion] = useState();
  const [formId, setFormId] = useState<string | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const formId = location.state?.form_id;
    if (formId) {
      setFormId(formId);
      loadFormData(formId);
    } else {
      setCreatedDate((prev) => prev || new Date().toISOString());
    }
  }, [location.state]);

  const loadFormData = async (id: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/forms/${id}`);
      const { name, fields, status, usage_count, dates } = response.data;

      console.log("Fetched form data:", response.data);

      setFormName(name);
      setFormStatus(status);
      setFormUsageCount(usage_count);

      // Save created date if present
      if (dates && dates.created) {
        setCreatedDate(dates.created);
      }

      const transformedFields: (FieldType | null)[][] = fields.map(
        (fieldGroup: FieldType[]) =>
          fieldGroup.map((field: FieldType) => {
            const baseFieldData: FieldType = {
              type: field.type,
              label: field.label || "",
              value: field.value || "",
            };

            switch (field.type) {
              case "text":
              case "user-text":
                return {
                  ...baseFieldData,
                  inputType: field.inputType || "text",
                };
              case "checkbox":
                return {
                  ...baseFieldData,
                  checked: field.checked || false,
                  checkboxText: field.value || "",
                };
              case "dropdown":
                return {
                  ...baseFieldData,
                  options:
                    field.options?.map((option) => ({
                      label: option.label || option,
                      value: option.value || option,
                    })) || [],
                };
              case "signature":
              case "file":
                return { ...baseFieldData, value: field.value || "" };
              default:
                console.warn(`Unknown field type: ${field.type}`);
                return null;
            }
          })
      );

      setFieldList(transformedFields);
    } catch (error) {
      console.error("Error loading form data:", error);
    }
  };

  const handleFieldAdd = (
    field: FieldType | null,
    rowIndex: number,
    index: number
  ) => {
    setFieldList((prev) => {
      const newFieldList = [...prev];
      if (!newFieldList[rowIndex]) newFieldList[rowIndex] = [];
      newFieldList[rowIndex][index] = field;
      return newFieldList;
    });
  };

  const handleRowAdd = () => {
    setFieldList((prev) => {
      // Only add a new row if the last row is not entirely empty
      const lastRow = prev[prev.length - 1];
      if (lastRow && lastRow.every((field) => field === null)) {
        return prev; 
      }
      return [...prev, [null]]; 
    });
  };

  const handleFieldDelete = (rowIndex: number, index: number) => {
    setFieldList((prev) => {
      const newFieldList = [...prev];
      newFieldList[rowIndex].splice(index, 1);

      // Remove the row if it's empty after deletion
      if (newFieldList[rowIndex].length === 0) {
        newFieldList.splice(rowIndex, 1);
      }

      // Ensure there's at least one row left
      return newFieldList.length === 0 ? [[null]] : newFieldList;
    });
  };

  const handleFieldUpdate = (
    updatedField: FieldType,
    rowIndex: number,
    index: number
  ) => {
    setFieldList((prev) => {
      const newFieldList = [...prev];
      newFieldList[rowIndex][index] = updatedField;
      return newFieldList;
    });
  };

  const saveForm = async (isDraft = false): Promise<string | undefined> => {
    if (!formName.trim()) {
      alert("Form name cannot be empty. Please enter a form name.");
      return undefined;
    }

    try {
      const formData = {
        user_id: "66dec27220c7d5ce67c2c186", // This is a hardcoded value and must be adjusted
        name: formName,
        dates: {
          created: createdDate, // Keep the original created date if available
          start: formDates.startDate
            ? new Date(formDates.startDate).toISOString()
            : null,
          end: formDates.endDate
            ? new Date(formDates.endDate).toISOString()
            : null,
          modified: new Date().toISOString(),
        },
        fields: fieldList
          .map((row) =>
            row
              .filter((field): field is FieldType => field !== null)
              .map((field) => {
                const baseFieldData = {
                  type: field.type,
                  label: field.label,
                  value: field.value || "",
                  ...(field.type === "user-text" && {
                    inputType: field.inputType,
                  }), 
                };

                if (field.type === "dropdown" && field.options) {
                  return {
                    ...baseFieldData,
                    options: field.options.map((option) => option),
                  };
                }

                if (field.type === "checkbox") {
                  return {
                    ...baseFieldData,
                    checked: field.checked || false,
                    value: field.checkboxText || "",
                  };
                }

                return baseFieldData;
              })
          )
          .filter((row) => row.length > 0),
        status: isDraft ? "draft" : formStatus,
        usage_count: formUsageCount,
        version: formId ? formVersion : 0,
        deleted: formId ? undefined : false, // Set deleted to false if form is new
      };

      const endpoint = formId
        ? `http://localhost:5000/api/forms/${formId}`
        : "http://localhost:5000/api/forms/create";
      const method = formId ? "put" : "post";

      const response = await axios({
        method,
        url: endpoint,
        data: formData,
      });

      const newFormId = response.data._id;
      if (!formId && newFormId) {
        setFormId(newFormId);
        console.log("New form created with ID:", newFormId);
      } else {
        console.log("Updating existing form with ID:", formId);
      }

      return newFormId || formId;
    } catch (error) {
      console.error("Error saving form:", error);
      alert("Failed to save form. Please try again.");
      return undefined;
    }
  };

  const handleSaveDraft = async () => {
    const savedFormId = await saveForm(true);
    if (savedFormId) {
      navigate("/ViewForms");
    }
  };

  const handleAddRules = async () => {
    const savedFormId = await saveForm();
    if (savedFormId) {
      navigate(`/setup-rules/${savedFormId}`);
    }
  };

  return (
    <div className="page-container">
      <div className="form-name-container">
        {isEditing ? (
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            onBlur={() => setIsEditing(false)}
            autoFocus
            spellCheck="false"
            placeholder="Enter Form Name"
            className="form-name-input"
          />
        ) : (
          <h1 onClick={() => setIsEditing(true)} className="form-name-heading">
            {formName || "Enter Form Name"}
          </h1>
        )}
      </div>

      <FieldTopBar />
      <FormBuilder
        fields={fieldList}
        onFieldAdd={handleFieldAdd}
        onRowAdd={handleRowAdd}
        onFieldDelete={handleFieldDelete}
        onFieldUpdate={handleFieldUpdate}
      />

      <div className="button-container">
        <button onClick={() => navigate("/")} className="cancel-button">
          Cancel
        </button>
        <div>
          <button
            onClick={handleSaveDraft}
            className="save-button"
            style={{ marginRight: "20px" }}
          >
            Save Draft
          </button>
          <button onClick={handleAddRules} className="save-button">
            Add Rules
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFormPage;
