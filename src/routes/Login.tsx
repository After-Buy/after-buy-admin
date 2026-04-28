import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/icon.png';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [adminAccount, setAdminAccount] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!adminAccount || !password) {
      setErrorMsg('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await axios.post('/api/admin/auth/login', {
        admin_account: adminAccount,
        password: password,
      }, {
        withCredentials: true
      });
 
      if (response.data.success) {
        login();
        navigate('/');
      } else {
        setErrorMsg(response.data.message || '로그인에 실패했습니다.');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.data && error.response.data.message) {
          setErrorMsg('로그인 실패: ' + error.response.data.message);
        } else {
          setErrorMsg('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
      } else {
        setErrorMsg('알 수 없는 오류가 발생했습니다.');
      }
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
      <form onSubmit={handleLogin} className='login-form'>
        <div>
          <label htmlFor="username">아이디</label>
          <input 
            type="text" 
            id="username" 
            placeholder="아이디를 입력하세요" 
            value={adminAccount}
            disabled={isLoading}
            onChange={(e) => setAdminAccount(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">비밀번호</label>
          <input 
            type="password" 
            id="password" 
            placeholder="비밀번호를 입력하세요" 
            value={password}
            disabled={isLoading}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>
      {errorMsg && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{errorMsg}</div>}
    </div>
  );
}

export default Login;