import { Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ReaderPage } from './pages/ReaderPage';
import { StyleguidePage } from './pages/StyleguidePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/novel/:novelId/chapter/:chapterId" element={<ReaderPage />} />
      <Route
        path="/novel/:novelId"
        element={<Navigate to="chapter/chapter-1" replace />}
      />
      <Route path="/styleguide" element={<StyleguidePage />} />
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}
