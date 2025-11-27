import { useState, useRef, useEffect } from 'react';

function TodoItem({ todo, onToggle, onDelete, onUpdate }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editIsAllDay, setEditIsAllDay] = useState(todo.is_all_day);
  const [editStartDate, setEditStartDate] = useState(todo.start_date || '');
  const [editEndDate, setEditEndDate] = useState(todo.end_date || '');
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
    if (editTitle.trim()) {
      try {
        await onUpdate(todo.id, {
          title: editTitle.trim(),
          is_all_day: editIsAllDay,
          start_date: editStartDate,
          end_date: editEndDate,
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
    setEditIsAllDay(todo.is_all_day);
    setEditStartDate(todo.start_date || '');
    setEditEndDate(todo.end_date || '');
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

  const formatDateTime = (startDate, endDate, isAllDay) => {
    if (!startDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isAllDay) {
      const startMonth = start.getMonth() + 1;
      const startDay = start.getDate();
      const endMonth = end.getMonth() + 1;
      const endDay = end.getDate();

      if (startMonth === endMonth && startDay === endDay) {
        return { text: `${startMonth}월 ${startDay}일`, color: 'text-gray-600' };
      }
      return { text: `${startMonth}월 ${startDay}일 ~ ${endMonth}월 ${endDay}일`, color: 'text-gray-600' };
    } else {
      const formatTime = (date) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${month}/${day} ${hours}:${minutes}`;
      };

      return { text: `${formatTime(start)} ~ ${formatTime(end)}`, color: 'text-gray-600' };
    }
  };

  const dateTimeInfo = formatDateTime(todo.start_date, todo.end_date, todo.is_all_day);

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
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={editIsAllDay}
            onChange={(e) => setEditIsAllDay(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">하루종일</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-600">
              {editIsAllDay ? '시작 날짜' : '시작 날짜/시간'}
            </label>
            <input
              type={editIsAllDay ? 'date' : 'datetime-local'}
              value={editIsAllDay ? editStartDate?.split('T')[0] : editStartDate?.slice(0, 16)}
              onChange={(e) => setEditStartDate(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">
              {editIsAllDay ? '종료 날짜' : '종료 날짜/시간'}
            </label>
            <input
              type={editIsAllDay ? 'date' : 'datetime-local'}
              value={editIsAllDay ? editEndDate?.split('T')[0] : editEndDate?.slice(0, 16)}
              onChange={(e) => setEditEndDate(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
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
        {dateTimeInfo && (
          <p className={`text-xs mt-1 ${dateTimeInfo.color}`}>
            {dateTimeInfo.text}
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
