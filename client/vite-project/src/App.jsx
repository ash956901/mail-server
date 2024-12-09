import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Compose from './components/Compose.jsx';
import Inbox from './components/Inbox.jsx';

// Simple auth check (you'd want a more robust solution in production)
const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  return user ? children : <Navigate to="/login" replace />;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/compose" 
          element={
            <PrivateRoute>
              <Compose />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/inbox" 
          element={
            <PrivateRoute>
              <Inbox />
            </PrivateRoute>
          } 
        />
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;