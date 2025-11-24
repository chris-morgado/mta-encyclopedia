import { Routes, Route } from 'react-router-dom'
import './App.css'
import MtaeMap from './pages/MtaeMap.tsx'
import Stop from './pages/Stop.tsx'

function App() {
  return (
    <>
      <Routes>
        <Route path="/map" element={<MtaeMap />} />
        <Route path="/stop/:id" element={<Stop />} />
      </Routes>
    </>
  )
}

export default App
