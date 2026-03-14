import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import MtaeMap from './pages/MtaeMap.tsx'
import Stop from './pages/Stop.tsx'
import Signup from './pages/Signup.tsx';
import Login from './pages/Login.tsx';
import { useAuth } from './context/AuthContext.tsx';

function App() {
  const { isAuthenticated, userEmail, logout } = useAuth();
  const navigate = useNavigate();
  
  return (
    <div>
      <nav>
        {isAuthenticated
          ? <><span>{userEmail}</span><button onClick={logout}>Sign out</button></>
          : <button onClick={() => { navigate('/login') }}>Sign in</button>
        }
      </nav>

      <Routes>
        <Route path="/map" element={<MtaeMap />} />
        <Route path="/stop/:id" element={<Stop />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </div>
  );
}

export default App;