import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './Layout';

const Landing = lazy(() => import('./pages/Landing'));
const Check = lazy(() => import('./pages/Check'));
const Bulk = lazy(() => import('./pages/Bulk'));
const History = lazy(() => import('./pages/History'));
const Extension = lazy(() => import('./pages/Extension'));

function PageFallback() {
  return (
    <div
      style={{
        minHeight: '40vh',
        display: 'grid',
        placeItems: 'center',
        background: '#050e1d',
        color: '#64748b',
      }}
    >
      Loading...
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="check" element={<Check />} />
          <Route path="scanner" element={<Navigate to="/check" replace />} />
          <Route path="bulk" element={<Bulk />} />
          <Route path="history" element={<History />} />
          <Route path="extension" element={<Extension />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
