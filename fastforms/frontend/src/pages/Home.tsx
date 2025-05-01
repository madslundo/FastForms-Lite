import React from 'react';
import '../App.css';


const Home: React.FC = () => {
    return (
        <div className="image-container">
            <img className='img' src={`${process.env.PUBLIC_URL}/KPI1.png`} alt="KPI 1" />
            <img className='img' src={`${process.env.PUBLIC_URL}/KPI2.png`} alt="KPI 2" />
        </div>
    );
};

export default Home;