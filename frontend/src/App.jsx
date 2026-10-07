import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import Landing from './pages/Landing';
import Check from './pages/Check';
import Bulk from './pages/Bulk';
import History from './pages/History';
import Extension from './pages/Extension';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="check" element={<Check />} />
          <Route path="bulk" element={<Bulk />} />
          <Route path="history" element={<History />} />
          <Route path="extension" element={<Extension />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
