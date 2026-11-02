import { Navigate, Route, Routes } from 'react-router-dom'
import { StyleguidePage } from './pages/StyleguidePage'

export default function App() {
  return (
    <Routes>
      <Route path="/styleguide" element={<StyleguidePage />} />
      <Route path="/" element={<Navigate to="/styleguide" replace />} />
      <Route path="*" element={<Navigate to="/styleguide" replace />} />
    </Routes>
  )
}
