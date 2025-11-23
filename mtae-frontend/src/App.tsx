import { Routes, Route } from 'react-router-dom'
import './App.css'
import MtaeMap from './pages/MtaeMap.tsx'

function App() {
  return (
    <>
      <Routes>
        <Route path="/map" element={<MtaeMap />} />
      </Routes>
    </>
  )
}

export default App
