import { useState, useRef, useEffect } from 'react';

function TodoItem({ todo, onToggle, onDelete, onUpdate }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDueDate, setEditDueDate] = useState(todo.due_date || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleToggle = async () => {
    try {
      await onToggle(todo.id);
    } catch (err) {
      console.error('Failed to toggle todo:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        setIsDeleting(true);
        await onDelete(todo.id);
      } catch (err) {
        console.error('Failed to delete todo:', err);
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = () => {
    if (!todo.is_completed) {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (editTitle.trim() && editTitle !== todo.title || editDueDate !== (todo.due_date || '')) {
      try {
        await onUpdate(todo.id, {
          title: editTitle.trim(),
          due_date: editDueDate || null,
          is_completed: todo.is_completed,
        });
      } catch (err) {
        console.error('Failed to update todo:', err);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDueDate(todo.due_date || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    if (targetDate.getTime() === today.getTime()) {
      return { text: '오늘', color: 'text-red-600' };
    } else if (targetDate.getTime() === tomorrow.getTime()) {
      return { text: '내일', color: 'text-orange-600' };
    } else {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return { text: `${month}월 ${day}일`, color: 'text-gray-600' };
    }
  };

  const dueDate = formatDate(todo.due_date);

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow-sm border border-blue-300">
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={200}
        />
        <input
          type="date"
          value={editDueDate}
          onChange={(e) => setEditDueDate(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700"
          >
            저장
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-1 px-3 rounded text-sm hover:bg-gray-400"
          >
            취소
          </button>
        </div>
        <div className="text-xs text-gray-500">
          <span>Enter: 저장 • ESC: 취소</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
        isDeleting ? 'opacity-50' : ''
      }`}
    >
      <input
        type="checkbox"
        checked={todo.is_completed}
        onChange={handleToggle}
        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer flex-shrink-0"
      />
      <div className="flex-1 min-w-0 cursor-pointer" onClick={handleEdit}>
        <p
          className={`text-sm font-medium ${
            todo.is_completed
              ? 'text-gray-400 line-through'
              : 'text-gray-900'
          }`}
        >
          {todo.title}
        </p>
        {dueDate && (
          <p className={`text-xs mt-1 ${dueDate.color}`}>
            {dueDate.text}
          </p>
        )}
      </div>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50 flex-shrink-0"
      >
        삭제
      </button>
    </div>
  );
}

export default TodoItem;
