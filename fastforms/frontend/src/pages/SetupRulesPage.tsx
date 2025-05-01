import React, { useState, useEffect, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./SetupRulesPage.css";
import { Option } from "../types/formBuilderTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";


const options: Option[] = [
  { value: "orderType", label: "Order type" },
  { value: "plant", label: "Plant" },
];

const conditionOptions: Option[] = [
  { value: "equal", label: "Equal to" },
  { value: "contains", label: "Contains" },
  { value: "lessThan", label: "Less than" },
  { value: "greaterThan", label: "Greater than" },
];

const logicalOperations: Option[] = [
  { value: "and", label: "And" },
  { value: "or", label: "Or" },
];

interface RuleType {
  option: Option | null;
  condition: Option | null;
  value: Option | null;
}

interface RuleWithLogical {
  rule: RuleType;
  logicalOperator?: Option | null;
}

const SetupRulesPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [formName, setFormName] = useState("");
  const navigate = useNavigate();
  const [orderTypeOptions, setOrderTypeOptions] = useState<Option[]>([]);
  const [plantOptions, setPlantOptions] = useState<Option[]>([]);
  const [rules, setRules] = useState<RuleWithLogical[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const formResponse = await axios.get(`http://localhost:5000/api/forms/${formId}`);
        setFormName(formResponse.data.name); // Form name is fetched from formTemplateRoutes

        // Fetch rules from ruleRoutes
        const rulesResponse = await axios.get(`http://localhost:5000/api/rules/${formId}`);
        const fetchedRules = rulesResponse.data?.conditions || []; // Default to empty array if no rules

        // Fetch options for orderTypes and plants from optionsRoutes
        const [orderTypeResponse, plantResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/options/order-types"),
          axios.get("http://localhost:5000/api/options/plants"),
        ]);

        console.log("Order Types:", orderTypeResponse.data);
        console.log("Plant Options:", plantResponse.data);

        const orderTypes = orderTypeResponse.data.orderTypes.map((type: string) => ({
          value: type,
          label: type,
        }));
        const plants = plantResponse.data.map((plant: string) => ({
          value: plant,
          label: plant,
        }));

        setOrderTypeOptions(orderTypes);
        setPlantOptions(plants);

        // If no rules exist for the formId, a new rule appears
        if (fetchedRules.length === 0) {
          const defaultRule: RuleWithLogical = {
            rule: {
              option: options[0], 
              condition: conditionOptions[0], 
              value: getOptionsForValue(options[0].value)[0] || null, 
            },
            logicalOperator: null, // No logical operator for the first rule (Important)
          };
          setRules([defaultRule]); // Add the default rule
        } else {
          const prefilledRules = fetchedRules.map((rule: any, index: number) => ({
            rule: {
              option: options.find((opt) => opt.value === rule.option) || null,
              condition: conditionOptions.find((cond) => cond.value === rule.condition) || null,
              value:
                (rule.option === "orderType"
                  ? orderTypes
                  : rule.option === "plant"
                  ? plants
                  : []
                ).find((val: Option) => val.value === rule.value) || null,
            },
            logicalOperator: index > 0
              ? logicalOperations.find((logic) => logic.value === fetchedRules[index - 1]?.logicalOperator)
              : null,
          }));
          setRules(prefilledRules);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (formId) fetchData();
  }, [formId]);

  // Ensure `getOptionsForValue` dynamically updates the dropdown options
  const getOptionsForValue = (selectedOption: string): Option[] => {
    // Ensure the case matches what you are passing
    if (selectedOption === "orderType") {
      return [{ value: "", label: "Select option" }, ...orderTypeOptions]; 
    }
    if (selectedOption === "plant") {
      return [{ value: "", label: "Select option" }, ...plantOptions];
    } // Add more cases here if needed
    return [{ value: "", label: "Select option" }];
  };

  const handleFirstDropdownChange = (event: ChangeEvent<HTMLSelectElement>, index: number) => {
    const selectedValue = event.target.value;
    const updatedRules = [...rules];
    updatedRules[index].rule.option = options.find((opt) => opt.value === selectedValue) || null;
    updatedRules[index].rule.value = getOptionsForValue(selectedValue)[0] || null;
    setRules(updatedRules);
  };

  const handleConditionDropdownChange = (event: ChangeEvent<HTMLSelectElement>, index: number) => {
    const selectedValue = event.target.value;
    const updatedRules = [...rules];
    updatedRules[index].rule.condition = conditionOptions.find((cond) => cond.value === selectedValue) || null;
    setRules(updatedRules);
  };

  const handleValueDropdownChange = (event: ChangeEvent<HTMLSelectElement>, index: number) => {
    const selectedValue = event.target.value;
    const updatedRules = [...rules];
    updatedRules[index].rule.value = getOptionsForValue(rules[index].rule.option?.value || "").find((val) => val.value === selectedValue) || null;
    setRules(updatedRules);
  };

  const handleLogicalDropdownChange = (event: ChangeEvent<HTMLSelectElement>, index: number) => {
    const selectedValue = event.target.value;
    const updatedRules = [...rules];
    updatedRules[index].logicalOperator = logicalOperations.find((logic) => logic.value === selectedValue) || null;
    setRules(updatedRules);
  };
  
 

  const handleSaveAsDraft = async () => {
    console.log("Attempting to save as draft");
    await handleSaveRules("draft");
  };
  
  const handleComplete = async () => {
    console.log("Attempting to complete form");
    await handleSaveRules("active");
  };
  
  const handleSaveRules = async (status: string) => {
    try {
      // Get the current form data, including status and version, from the backend
      const formResponse = await axios.get(`http://localhost:5000/api/forms/${formId}`);
      const formData = formResponse.data;
      const currentVersion = formData.version || 0;
  
      // Create the rules payload
      const payload = {
        form_id: formId,
        rules: rules.map((rule, index) => ({
          rule: rule.rule,
          option: rule.rule.option,
          logicalOperator: index > 0 && index < rules.length ? rule.logicalOperator || logicalOperations[0] : null,
        })),
      };
  
      // Filter out rules with missing fields
      const filteredPayload = {
        ...payload,
        rules: payload.rules.filter((rule) => rule.rule.option && rule.rule.condition && rule.rule.value && rule.rule.value.value !== ""),
      };
        if (filteredPayload.rules.length !== payload.rules.length) {
      alert("Some rules contain invalid fields and were not saved.");
    }
  
      // Save rules in the database (rules are saved regardless of form status)
      await axios.post("http://localhost:5000/api/rules/create", filteredPayload);
  
      // Update form status and version only if necessary
      if (formData.status !== status || (status === "active" && formData.version !== currentVersion + 1)) {
        await axios.put(`http://localhost:5000/api/forms/${formId}`, {
          status: status,
          version: status === "active" ? currentVersion + 1 : currentVersion, // Increment version only on active
        });
      }
  
      navigate("/ViewForms");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error saving rules or updating form status:", error.response ? error.response.data : error.message);
      } else {
        console.error("Error saving rules or updating form status:", error);
      }
    }
  };

  const handleBackToCreateForm = () => {
    navigate(`/create-form/`, { state: { form_id: formId } });
  };

  const handleAddRule = () => {
    setRules((prevRules) => [
      ...prevRules,
      {
        rule: {
          option: options[0], 
          condition: conditionOptions[0],
          value: getOptionsForValue(options[0].value)[0] || null, 
        },
        logicalOperator: prevRules.length > 0 ? logicalOperations[0] : null, // No logical operator for the first rule
      },

    ]);
  };

  const handleDeleteRule = (index: number) => {
    if (rules.length > 1) {
      setRules((prevRules) => prevRules.filter((_, i) => i !== index));
    } else {
      alert("At least one rule is required.");
    }
  };

  // Update rule order based on drag-and-drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const updatedRules = Array.from(rules);
    const [movedRule] = updatedRules.splice(result.source.index, 1);
    updatedRules.splice(result.destination.index, 0, movedRule);

    setRules(updatedRules);
  };


  return (
    <div>
      <div>
    <div className="dropdown-container">
      <div className="header">
        <h2>Add Rules for: {formName}</h2>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="rules">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {rules.map((ruleWithLogical, rowIndex) => (
                <Draggable
                  key={rowIndex}
                  draggableId={`rule-${rowIndex}`}
                  index={rowIndex}
                >
                  {(provided) => (
                    <div
                      className="dropdown-row"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      {rowIndex > 0 && (
                        <div className="dropdown-logical-container">
                          <select
                            className="dropdown-logical"
                            value={ruleWithLogical.logicalOperator?.value || ""}
                            onChange={(e) =>
                              handleLogicalDropdownChange(e, rowIndex)
                            }
                          >
                            {logicalOperations.map((logic) => (
                              <option key={logic.value} value={logic.value}>
                                {logic.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div className="dropdown-row-content">
                        <h3 className="ruleNumber">Rule {rowIndex + 1}</h3>
                        <select
                          className="dropdown-box"
                          value={ruleWithLogical.rule.option?.value || ""}
                          onChange={(e) =>
                            handleFirstDropdownChange(e, rowIndex)
                          }
                        >
                          {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <select
                          className="dropdown-box-middle"
                          value={ruleWithLogical.rule.condition?.value || ""}
                          onChange={(e) =>
                            handleConditionDropdownChange(e, rowIndex)
                          }
                        >
                          {conditionOptions.map((cond) => (
                            <option key={cond.value} value={cond.value}>
                              {cond.label}
                            </option>
                          ))}
                        </select>
                        <select
                          className="dropdown-box"
                          value={ruleWithLogical.rule.value?.value || ""}
                          onChange={(e) =>
                            handleValueDropdownChange(e, rowIndex)
                          }
                        >
                          {getOptionsForValue(
                            ruleWithLogical.rule.option?.value || ""
                          ).map((val) => (
                            <option key={val.value} value={val.value}>
                              {val.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleDeleteRule(rowIndex)}
                          style={{
                            position: "absolute",
                            top: "5px",
                            right: "5px",
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} color="grey" />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      </div>
      <div className="button-container">
        <button className="add-button" onClick={handleAddRule}>
          +
        </button>
      </div>
      <div className="button-wrapper">
        <button className="buttonLeft" onClick={handleBackToCreateForm}>
        Back
        </button>
        <button className="buttonRight" onClick={handleSaveAsDraft}>
          Save Draft
        </button>
        <button className="buttonRight" onClick={handleComplete} style={{ marginRight: "20px" }}
        >
          Complete
        </button>
      </div>
    </div>
    </div>
  );
};

export default SetupRulesPage;
