import { useEffect, useState } from "react"
import axios from "axios";

function Dashboard() {
    const [users, setUsers] = useState(1234);
    const [newUsers, setNewUsers] = useState(56);
    const [errorLogs, setErrorLogs] = useState(0);

    useEffect(() => {
        // axios.get('/api/dashboard')
        //     .then(response => {
        //         setUsers(response.data.users);
        //         setNewUsers(response.data.newUsers);
        //         setErrorLogs(response.data.errorLogs);
        //     })
        //     .catch(error => {
        //         console.error('대시보드 데이터 로드 오류:', error);
        //     });
    }   , []);


    return (
        <>
            <h2>대시보드</h2>
            <div className="container">
                <div className="row">
                    <div className="card stats">
                        <h5>전체 사용자</h5>
                        <h2>{users.toLocaleString()}명</h2>
                    </div>
                    <div className="card stats">
                        <h5>신규 사용자</h5>
                        <h2>{newUsers.toLocaleString()}명</h2>
                    </div>
                    <div className="card stats">
                        <h5>에러 로그 현황</h5>
                        <h2>{errorLogs.toLocaleString()}건</h2>
                    </div>
                </div>
                <div className="row">
                    <div className="card ocr">
                        <h5>OCR 인식률</h5>
                    </div>
                    <div className="card">
                        <h5>공지사항</h5>
                        <ul>
                            <li>새로운 기능 업데이트</li>
                            <li>서버 점검 완료</li>
                            <li>Q&A 이용 규칙</li>
                        </ul>
                    </div>
                </div>
                <div className="card error">
                    <h5>에러 로그 관리</h5>
                    <table>
                        <thead>
                            <tr>
                                <th>발생 일시</th>
                                <th>에러 유형</th>
                                <th>타임스탬프</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>2026-02-24 16:32</td> 
                                <td>Warning</td>
                                <td>관리자 로그인 시도 중 인증 실패 발생</td>
                            </tr>
                            <tr>
                                <td>2024-06-02</td>
                                <td>데이터베이스 오류</td>
                                <td>공지사항 조회 시 데이터베이스 연결 오류 발생</td>
                            </tr>
                            <tr>
                                <td>2024-06-03</td>
                                <td>OCR 인식 실패</td>
                                <td>OCR 처리 중 이미지 인식 실패 발생</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </>
    )
}

export default Dashboard