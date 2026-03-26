import './App.css'
import { Routes, Route} from 'react-router-dom';
import Layout from './components/Layout.tsx';

function App() {

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<h2>대시보드</h2>} />
        <Route path="notice" element={<h2>공지사항</h2>} />
        <Route path="error" element={<h2>에러 로그</h2>} />
        <Route path="guide" element={<h2>이용 안내</h2>} />
        <Route path="log" element={<h2>로그인 내역</h2>} />
        <Route path="ocr" element={<h2>OCR 오인식</h2>} />
      </Route>
    </Routes>
  )
}

export default App
