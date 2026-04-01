import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/icon.png';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [adminAccount, setAdminAccount] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminAccount || !password) {
      setErrorMsg('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admin_account: adminAccount,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        login(); // Context 상태 변경
        navigate('/');
      } else {
        // API 명세의 에러 메시지(message 필드) 표시
        setErrorMsg(data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      setErrorMsg('서버와 연결을 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login-header">
        <img src={logo} alt="After-Buy Logo" className="logo" />
        <div className="login-title">
          <h1>After-Buy</h1>
          <h2 className="subtitle">관리자</h2>
        </div>
      </div>
      
      <form onSubmit={handleLogin} className="login-form">
        {errorMsg && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{errorMsg}</div>}
        
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="아이디"
            value={adminAccount}
            onChange={(e) => setAdminAccount(e.target.value)}
            disabled={isLoading}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        
        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px' }}>
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}

export default Login;