import './App.css'
import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout.tsx';
import Login from './routes/Login.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';

const Dashboard = lazy(() => import('./routes/Dashboard.tsx'));
const Notice = lazy(() => import('./routes/Notice.tsx'));
const NoticeDetail = lazy(() => import('./routes/NoticeDetail.tsx'));
const NoticeCreate = lazy(() => import('./routes/NoticeCreate.tsx'));
const Error = lazy(() => import('./routes/Error.tsx'));
const ErrorDetail = lazy(() => import('./routes/ErrorDetail.tsx'));
const Guide = lazy(() => import('./routes/Guide.tsx'));
const GuideDetail = lazy(() => import('./routes/GuideDetail.tsx'));
const GuideCreate = lazy(() => import('./routes/GuideCreate.tsx'));
const Log = lazy(() => import('./routes/Log.tsx'));
const LogDetail = lazy(() => import('./routes/LogDetail.tsx'));
const Ocr = lazy(() => import('./routes/Ocr.tsx'));


function App() {

  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>로딩 중...</div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />} >
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="notice" element={<Notice />} />
            <Route path="notice/new" element={<NoticeCreate />} />
            <Route path="notice/:id" element={<NoticeDetail />} />
            <Route path="error" element={<Error />} />
            <Route path="error/:id" element={<ErrorDetail />} />
            <Route path="guide" element={<Guide />} />
            <Route path="guide/new" element={<GuideCreate />} />
            <Route path="guide/:id" element={<GuideDetail />} />
            <Route path="log" element={<Log />} />
            <Route path="log/:id" element={<LogDetail />} />
            <Route path="ocr" element={<Ocr />} />
          </Route>
        </Route>
        <Route path="*" element={<Login />} />
      </Routes>
    </Suspense>
  )
}

export default App
