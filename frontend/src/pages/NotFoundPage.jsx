import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">페이지를 찾을 수 없습니다</p>
        <Link to="/login" className="text-blue-600 hover:text-blue-800 underline">
          로그인 페이지로 이동
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
