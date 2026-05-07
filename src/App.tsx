import './App.css'
import { Routes, Route} from 'react-router-dom';
import Layout from './components/Layout.tsx';
import Dashboard from './routes/Dashboard.tsx';
import Notice from './routes/Notice.tsx';
import NoticeDetail from './routes/NoticeDetail.tsx';
import NoticeCreate from './routes/NoticeCreate.tsx';
import Error from './routes/Error.tsx';
import ErrorDetail from './routes/ErrorDetail.tsx';
import Guide from './routes/Guide.tsx';
import GuideDetail from './routes/GuideDetail.tsx';
import Log from './routes/Log.tsx';
import LogDetail from './routes/LogDetail.tsx';
import Ocr from './routes/Ocr.tsx';
import Login from './routes/Login.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import GuideCreate from './routes/GuideCreate.tsx';

function App() {

  return (
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
  )
}

export default App
