import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './Home.js';
import PageNotFound from './PageNotFound.js';

function App() {
  return (
    <div className="Router">
      <Routes>
        <Route exact path = "/" element={<Home />}></Route>
        <Route exact path = "*" element={<PageNotFound />}></Route>
      </Routes>
    </div>
  );
}

export default App;
