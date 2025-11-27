import { useForm } from 'react-hook-form';
import { useState } from 'react';

function TodoForm({ onAdd }) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setError('');
      setIsLoading(true);
      await onAdd(data);
      reset();
    } catch (err) {
      setError(err.message || '할일 추가에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            할일
          </label>
          <input
            id="title"
            type="text"
            {...register('title', {
              required: '할일을 입력해주세요',
              maxLength: {
                value: 200,
                message: '할일은 최대 200자까지 입력 가능합니다',
              },
            })}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="할일을 입력하세요"
            disabled={isLoading}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
            기한
          </label>
          <input
            id="due_date"
            type="date"
            {...register('due_date', {
              required: '기한을 선택해주세요',
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
          {errors.due_date && (
            <p className="mt-1 text-sm text-red-600">{errors.due_date.message}</p>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? '추가 중...' : '추가하기'}
        </button>
      </form>
    </div>
  );
}

export default TodoForm;
