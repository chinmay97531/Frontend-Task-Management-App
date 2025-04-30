import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Auth from "./pages/Auth.jsx";
import { Dashboard } from './pages/Dashboard.jsx';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/home" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;