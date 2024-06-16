// src/App.js
import React from 'react';
import Canvas from './canvas';
import './App.css';

const App = () => {
  return (
    <div className="App">
       <div className='flex flex-col content-center justify-center'>
              <p className='flex text-l font-inter font-bold mx-auto p-1 mt-2'>Geometry App: Making Shapes</p>

              <Canvas />
      </div>
      
    </div>
  );
};

export default App;
