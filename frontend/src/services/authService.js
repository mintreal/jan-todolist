import api from './api';
import { saveToken, saveUser } from '../utils/localStorage';

export const signup = async (email, password, name) => {
  try {
    const response = await api.post('/api/auth/signup', {
      email,
      password,
      name,
    });

    const { token, user } = response.data;

    saveToken(token);
    saveUser(user);

    return { token, user };
  } catch (error) {
    throw error.response?.data || { message: '회원가입에 실패했습니다' };
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });

    const { token, user } = response.data;

    saveToken(token);
    saveUser(user);

    return { token, user };
  } catch (error) {
    throw error.response?.data || { message: '로그인에 실패했습니다' };
  }
};
