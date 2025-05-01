import React, { useEffect, useState } from "react";
import axios from "axios";
import { FormTemplate } from "../types/FormTemplate";
import { useNavigate } from "react-router-dom";
import Table from "../components/Table";
import "../components/Table.css";
import View from "../components/View";

const ViewForms: React.FC = () => {
  const [forms, setForms] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string }>({
    key: "dates.created",
    direction: "descending",
  });
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;


  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/forms");
        // Add `deleted` flag to each form
        const formsWithDeletedFlag = response.data.map((form: FormTemplate) => ({
          ...form,
          deleted: false,
        }));
        setForms(formsWithDeletedFlag);
      } catch (error) {
        setError("Error fetching forms");
      } finally {
        setLoading(false);
      }
    };

    fetchForms(); // Fetches all forms that are not soft deleted
  }, []);

  // Sort the data based on sortConfig
  const getSortedData = () => {
    return [...forms].sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof FormTemplate];
      let bValue: any = b[sortConfig.key as keyof FormTemplate];

      if (sortConfig.key.startsWith("dates.")) {
        const dateKey = sortConfig.key.split(".")[1] as keyof typeof a.dates;
        aValue = new Date(a.dates[dateKey]!).getTime();
        bValue = new Date(b.dates[dateKey]!).getTime();
      }

      if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (key: string) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleView = (form: FormTemplate) => {
    if (!selectedForm || selectedForm._id !== form._id) {
      setSelectedForm(form);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedForm(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleEdit = (form: FormTemplate) => {
    navigate(`/create-form/${form._id}`, { state: { form_id: form._id } });
  };

  // handleDelete function to only mark as deleted in frontend state
  const handleDelete = async (formId: string) => {
    // Confirm the deletion
    const confirmDelete = window.confirm("Are you sure you want to delete this form?");
  
    if (!confirmDelete) {
      return; 
    }
  
    try {
      await axios.patch(`http://localhost:5000/api/forms/soft-delete/${formId}`);
      setForms((prevForms) =>
        prevForms.map((form) =>
          form._id === formId ? { ...form, deleted: true } : form
        )
      );
    } catch (error) {
      setError("Error marking form as deleted");
    }
  };
  

  const handleStatusChange = async (formId: string, newStatus: 'active' | 'draft' | 'inactive') => {
    try {
      await axios.patch(`http://localhost:5000/api/forms/${formId}`, { status: newStatus });
      setForms((prevForms) =>
        prevForms.map((form) =>
          form._id === formId ? { ...form, status: newStatus } : form
        )
      );
    } catch (error) {
      setError('Error updating status');
    }
  };

  const filteredData = getSortedData().filter((form) => {
    return (
      !form.deleted &&
      (form._id?.toString().includes(searchQuery) ||
        form.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (form.dates.created &&
          new Date(form.dates.created).toLocaleString().includes(searchQuery)) ||
        form.version?.toString().includes(searchQuery) ||
        form.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        form.usage_count?.toString().includes(searchQuery))
    );
  });



  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const paginatedData = filteredData.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  const changePage = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const handleProcessRules = async () => {
    try {
      await axios.post('http://localhost:5000/api/process-rules'); 
      alert('Rules processed successfully!');
    } catch (error) {
        console.error('Error processing rules:', error);
        alert('Failed to process rules. Check the console for details.');
    }
};
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="view-forms">
    <button onClick={handleProcessRules}>Process Rules</button>
      <div className="container">
        <button
          className="SetupRulesButton"
          onClick={() => navigate("/create-form")}
        >
          Create new form
        </button>
        <input
          type="text"
          placeholder="Search..."
          className="search"
          value={searchQuery}
          onChange={handleChange}
        />
      </div>

      <Table
        data={paginatedData}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        onSort={handleSort} // Pass sorting function
        sortConfig={sortConfig} // Pass sorting config to maintain icons
      />

      {isModalOpen && selectedForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={handleCloseModal}>
              ×
            </button>
            <View
              formElements={selectedForm.fields}
              formName={selectedForm.name}
            />
          </div>
        </div>
      )}

      <div className="pagination">
        <button
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {"<"}
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          {">"}
        </button>
      </div>
    </div>
  );
};

export default ViewForms;
