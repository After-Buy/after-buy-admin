import { useNavigate } from 'react-router-dom';
import logo from '../assets/icon.png';
function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // 로그인 인증 로직 추가 예정
    localStorage.setItem('isLoggedIn', 'true');
    navigate('/');
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
        <button onClick={handleLogin}>로그인</button>
    </div>
  );
}

export default Login;