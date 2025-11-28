import api from './api';

const extractErrorMessage = (error, defaultMessage) => {
  const errorData = error.response?.data;
  if (!errorData) return defaultMessage;

  return errorData.error || errorData.message || defaultMessage;
};

export const getTodos = async () => {
  try {
    const response = await api.get('/api/todos');
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, '할일 목록을 불러오는데 실패했습니다'));
  }
};

export const createTodo = async (todoData) => {
  try {
    const response = await api.post('/api/todos', todoData);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, '할일 생성에 실패했습니다'));
  }
};

export const updateTodo = async (id, todoData) => {
  try {
    const response = await api.put(`/api/todos/${id}`, todoData);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, '할일 수정에 실패했습니다'));
  }
};

export const deleteTodo = async (id) => {
  try {
    await api.delete(`/api/todos/${id}`);
    return { success: true };
  } catch (error) {
    throw new Error(extractErrorMessage(error, '할일 삭제에 실패했습니다'));
  }
};
