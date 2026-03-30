import { useNavigate } from 'react-router-dom';
import logo from '../assets/icon.png';
import { useState } from 'react';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();

  let [username, setUsername] = useState('');
  let [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      alert('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }
    
    try {
      const response = await axios.post('/api/admin/auth/login', { 
        admin_account: username, 
        password 
      }, { 
        withCredentials: true 
      });

      if (response.data.success) {
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/');
      } else {
        alert('로그인 실패: ' + response.data.message);
      }
    } catch (error: any) {
      console.error('로그인 오류:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert('로그인 실패: ' + error.response.data.message);
      } else {
        alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <div className="login">
        <div className="login-header">
            <img src={logo} alt="After-Buy Logo" className='logo'/>
            <div className='login-title'>
                <h1>After-Buy</h1>
                <h2 className='subtitle'>관리자</h2>
            </div>
        </div>
        <div className='login-form'>
          <div>
            <label htmlFor="username">아이디</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              placeholder="아이디를 입력하세요" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">비밀번호</label>
            <input type="password"
             id="password" 
             name="password" 
             placeholder="비밀번호를 입력하세요" 
             value={password}
             onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button onClick={handleLogin}>로그인</button>
        </div>
    </div>
  );
}

export default Login;