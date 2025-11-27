import { useState, useEffect } from 'react';
import { getTodos, createTodo, updateTodo, deleteTodo } from '../services/todoService';

export const useTodos = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTodos();
      setTodos(data);
    } catch (err) {
      setError(err.message || '할일 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async (todoData) => {
    try {
      const newTodo = await createTodo(todoData);
      setTodos([newTodo, ...todos]);
      return newTodo;
    } catch (err) {
      throw err;
    }
  };

  const modifyTodo = async (id, todoData) => {
    try {
      const updatedTodo = await updateTodo(id, todoData);
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
      return updatedTodo;
    } catch (err) {
      throw err;
    }
  };

  const removeTodo = async (id) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await modifyTodo(id, { ...todo, is_completed: !todo.is_completed });
    }
  };

  return {
    todos,
    loading,
    error,
    addTodo,
    modifyTodo,
    removeTodo,
    toggleTodo,
    refetch: fetchTodos,
  };
};
