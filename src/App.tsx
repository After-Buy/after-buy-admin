import './App.css'
import { Routes, Route} from 'react-router-dom';
import Layout from './components/Layout.tsx';
import Dashboard from './routes/Dashboard.tsx';
import Notice from './routes/Notice.tsx';
import Error from './routes/Error.tsx';
import Guide from './routes/Guide.tsx';
import Log from './routes/Log.tsx';
import Ocr from './routes/Ocr.tsx';
import Login from './routes/Login.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';

function App() {

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />} >
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="notice" element={<Notice />} />
          <Route path="error" element={<Error />} />
          <Route path="guide" element={<Guide />} />
          <Route path="log" element={<Log />} />
          <Route path="ocr" element={<Ocr />} />
        </Route>
      </Route>
      <Route path="*" element={<Login />} />
    </Routes>
  )
}

export default App
