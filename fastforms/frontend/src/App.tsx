// src/App.tsx
import React from "react";
import { Route, Routes } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Home from "./pages/Home";
import CreateForm from "./pages/CreateFormPage";
import SetupRules from "./pages/SetupRulesPage";
import ViewForms from "./pages/ViewForms";
import Statistics from "./pages/Statistics";
import Navbar from "./components/Navbar";

const App: React.FC = () => {
  return (
    <div>
      <DndProvider backend={HTML5Backend}>
      <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/ViewForms" element={<ViewForms />} />
                    <Route path="/Statistics" element={<Statistics />} />
                    <Route path="/create-form" element={<CreateForm />} />
                    <Route path="/create-form/:formId" element={<CreateForm />} />
                    <Route path="/setup-rules/:formId" element={<SetupRules />} />
                </Routes>
      </DndProvider>
    </div>
  );
};
export default App;
