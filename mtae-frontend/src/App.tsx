import { Routes, Route } from 'react-router-dom'
import './App.css'
import Map from './pages/Map.tsx'

function App() {
  return (
    <>
      <Routes>
        <Route path="/map" element={<Map />} />
      </Routes>
    </>
  )
}

export default App
