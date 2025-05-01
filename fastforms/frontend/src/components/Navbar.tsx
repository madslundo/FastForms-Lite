import React from 'react';
import { NavLink } from 'react-router-dom';
import "./Navbar.css"


const Navbar: React.FC = () => (
  <div>
    <h3 className='logout'>Logout</h3>
    <div className="logo-circle"> 
    <div className="logo-container">
      <img className='logo' src={`${process.env.PUBLIC_URL}/Arkyn_logo.png`} alt="Arkyn Logo" />
    </div>
  </div>
    <nav>
      <ul>
        <li>
          <NavLink to="/">Home</NavLink>
        </li>
        <li>
          <NavLink to="/ViewForms">View Forms</NavLink>
        </li>
        <li>
          <NavLink to="/Statistics">Statistics</NavLink>
        </li>
      </ul>
    </nav>
  </div>
);

export default Navbar;
