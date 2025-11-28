import { useForm } from 'react-hook-form';
import { useState } from 'react';

function TodoForm({ onAdd }) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      is_all_day: true,
    },
  });

  const isAllDay = watch('is_all_day', true);

  const onSubmit = async (data) => {
    try {
      setError('');
      setIsLoading(true);
      await onAdd(data);
      reset({ is_all_day: true });
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': 'var(--color-primary)' }}
            placeholder="할일을 입력하세요"
            disabled={isLoading}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              {...register('is_all_day')}
              className="w-4 h-4 rounded"
              style={{ accentColor: 'var(--color-primary)' }}
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-gray-700">하루종일</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
              {isAllDay ? '시작 날짜' : '시작 날짜/시간'}
            </label>
            <input
              id="start_date"
              type={isAllDay ? 'date' : 'datetime-local'}
              {...register('start_date', {
                required: '시작 날짜를 선택해주세요',
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--color-primary)' }}
              disabled={isLoading}
            />
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
              {isAllDay ? '종료 날짜' : '종료 날짜/시간'}
            </label>
            <input
              id="end_date"
              type={isAllDay ? 'date' : 'datetime-local'}
              {...register('end_date', {
                required: '종료 날짜를 선택해주세요',
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--color-primary)' }}
              disabled={isLoading}
            />
            {errors.end_date && (
              <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          style={{
            backgroundColor: 'var(--color-primary)',
          }}
          onMouseOver={(e) => {
            if (!isLoading) e.target.style.backgroundColor = 'var(--color-primary-hover)';
          }}
          onMouseOut={(e) => {
            if (!isLoading) e.target.style.backgroundColor = 'var(--color-primary)';
          }}
        >
          {isLoading ? '추가 중...' : '추가하기'}
        </button>
      </form>
    </div>
  );
}

export default TodoForm;
