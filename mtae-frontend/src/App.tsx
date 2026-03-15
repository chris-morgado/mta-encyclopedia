import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import MtaeMap from './pages/MtaeMap.tsx'
import Stop from './pages/Stop.tsx'
import Signup from './pages/Signup.tsx';
import Login from './pages/Login.tsx';
import { useAuth } from './context/AuthContext.tsx';
import Profile from './pages/Profile.tsx';

function App() {
  const { isAuthenticated, userEmail, logout, getToken } = useAuth();
  const navigate = useNavigate();
  const token = getToken();
  const currentuserId = token ? JSON.parse(atob(token.split('.')[1])).sub : null;
  
  return (
    <div>
      <nav>
        {isAuthenticated
          ? 
          <>
            <span
              onClick={() => navigate(`/profile/${currentuserId}`)}
              className="cursor-pointer hover:underline"
            >{userEmail}</span>
            <button onClick={logout}>Sign out</button>
          </>
          : <button onClick={() => { navigate('/login') }}>Sign in</button>
        }
      </nav>

      <Routes>
        <Route path="/map" element={<MtaeMap />} />
        <Route path="/stop/:id" element={<Stop />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile/:userId" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;