import React from "react";
import { BsFillTrashFill } from "react-icons/bs";
import { FormTemplate } from "../types/FormTemplate";
import "../components/Table.css";

interface TableProps {
  data: FormTemplate[];
  onView: (form: FormTemplate) => void;
  onEdit: (form: FormTemplate) => void;
  onDelete: (formId: string) => void;
  onStatusChange: (
    formId: string,
    newStatus: "active" | "draft" | "inactive"
  ) => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: string };
}

const Table: React.FC<TableProps> = ({
  data,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onSort,
  sortConfig,
}) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? "▲" : "▼";
    }
    return "";
  };

  const sortData = (data: FormTemplate[], key: keyof FormTemplate | string, direction: string) => {
    return data.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Handle date fields specifically
      if (key === "dates.created") {
        aValue = new Date(a.dates.created).getTime();
        bValue = new Date(b.dates.created).getTime();
      } else if (key === "dates.modified") {
        aValue = new Date(a.dates.modified).getTime();
        bValue = new Date(b.dates.modified).getTime();
      } else if (key === "name") {
        // Use localeCompare for case-insensitive string comparison
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        return direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        aValue = a[key as keyof FormTemplate];
        bValue = b[key as keyof FormTemplate];
      }

      // Handle invalid dates: place them at the end
      if (isNaN(aValue) && isNaN(bValue)) return 0; // Both invalid
      if (isNaN(aValue)) return 1; // a is invalid, push it down
      if (isNaN(bValue)) return -1; // b is invalid, push it down

      // Handle sorting direction
      if (aValue < bValue) return direction === "ascending" ? -1 : 1;
      if (aValue > bValue) return direction === "ascending" ? 1 : -1;
      return 0; // if equal
    });
  };

  const sortedData = sortData([...data], sortConfig.key, sortConfig.direction);

  // Define sortable headers
  const sortableHeaders = ["Name", "Date Created", "Date Modified", "Version", "Status", "Usage Count"];

  return (
    <div className="grid-table-container">
      <div className="grid-table-header">
        {[
          "ID",
          "Name",
          "Date Created",
          "Date Modified",
          "Version",
          "Status",
          "Usage Count",
          "",
        ].map((header, index) => (
          <div
            key={index}
            className={`grid-table-cell header-cell ${sortableHeaders.includes(header) ? 'sortable' : ''}`}
            onClick={() => {
              if (sortableHeaders.includes(header)) {
                onSort(
                  header === "Date Created"
                    ? "dates.created"
                    : header === "Date Modified"
                    ? "dates.modified"
                    : header.toLowerCase().replace(" ", "_")
                );
              }
            }}
          >
            {header}
            <span className="sort-icon">
              {getSortIcon(
                header === "Date Created"
                  ? "dates.created"
                  : header === "Date Modified"
                  ? "dates.modified"
                  : header.toLowerCase().replace(" ", "_")
              )}
            </span>
          </div>
        ))}
      </div>
      {sortedData.map((form) => (
        <div key={form._id} className="grid-table-row">
          <div className="grid-table-cell">{form._id}</div>
          <div className="grid-table-cell">{form.name}</div>
          <div className="grid-table-cell">
            {new Date(form.dates.created).toLocaleDateString()}
          </div>
          <div className="grid-table-cell">
            {new Date(form.dates.modified).toLocaleDateString()}
          </div>
          <div className="grid-table-cell">{form.version}</div>
          <div className="grid-table-cell">
            <select
              value={form.status}
              onChange={(e) =>
                onStatusChange(
                  form._id,
                  e.target.value as "active" | "draft" | "inactive"
                )
              }
              className={`status-dropdown status-${form.status}`}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="grid-table-cell">{form.usage_count}</div>
          <div id="actions" className="grid-table-cell">
            <button className="button" onClick={() => onView(form)}>
              View
            </button>
            <button className="button" onClick={() => onEdit(form)}>
              Edit
            </button>
            <span className="delete-btn" onClick={() => onDelete(form._id)}>
              <BsFillTrashFill />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Table;
