import { useTodos } from '../hooks/useTodos';
import { getUser, clearAuth } from '../utils/localStorage';
import { useNavigate } from 'react-router-dom';
import TodoForm from '../components/Todo/TodoForm';
import TodoList from '../components/Todo/TodoList';
import Header from '../components/Layout/Header';

function TodoPage() {
  const navigate = useNavigate();
  const user = getUser();
  const { todos, loading, error, addTodo, toggleTodo, removeTodo, modifyTodo } = useTodos();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Jan TodoList</h1>
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm text-gray-600">{user.name}님</span>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">할일 목록</h2>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <TodoForm onAdd={addTodo} />
        <TodoList todos={todos} onToggle={toggleTodo} onDelete={removeTodo} onUpdate={modifyTodo} />
      </div>
    </div>
  );
}

export default TodoPage;
