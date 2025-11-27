const request = require('supertest');
const app = require('../src/app'); // app.js를 직접 사용해 미들웨어만 테스트
const userModel = require('../src/models/userModel');
const { sign } = require('../src/utils/jwtToken');
const bcrypt = require('bcrypt');

// jest.mock을 사용하여 모듈을 모킹합니다.
jest.mock('../src/models/userModel');
jest.mock('../src/utils/jwtToken');
jest.mock('bcrypt');

describe('Auth API: /api/auth', () => {
  afterEach(() => {
    jest.clearAllMocks(); // 각 테스트 후에 모든 모킹을 초기화합니다.
  });

  describe('POST /signup - 회원가입', () => {
    const signupData = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
    };

    it('성공: 유효한 정보로 회원가입 시 201 상태 코드와 토큰을 반환해야 합니다', async () => {
      const mockNewUser = { id: 2, ...signupData };
      const mockToken = 'mock-jwt-token-for-signup';

      userModel.findByEmail.mockResolvedValue(null); // 이메일 중복 없음
      userModel.create.mockResolvedValue(mockNewUser);
      sign.mockReturnValue(mockToken);

      const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData);

      expect(response.status).toBe(201);
      expect(response.body.token).toBe(mockToken);
      expect(response.body.user.email).toBe(signupData.email);
      expect(userModel.findByEmail).toHaveBeenCalledWith(signupData.email);
      expect(userModel.create).toHaveBeenCalledWith(signupData);
      expect(sign).toHaveBeenCalledWith({ userId: mockNewUser.id, email: mockNewUser.email });
    });

    it('실패: 이미 존재하는 이메일로 회원가입 시 400 상태 코드를 반환해야 합니다', async () => {
      const existingUser = { id: 1, email: signupData.email, name: 'Existing User' };
      userModel.findByEmail.mockResolvedValue(existingUser);

      const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('이미 사용 중인 이메일입니다');
      expect(userModel.create).not.toHaveBeenCalled();
    });

    it('실패: 비밀번호가 8자 미만일 경우 400 상태 코드를 반환해야 합니다', async () => {
        const response = await request(app)
          .post('/api/auth/signup')
          .send({ ...signupData, password: 'short' });
  
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('비밀번호는 최소 8자 이상이어야 합니다');
      });
  });

  describe('POST /login - 로그인', () => {
    const loginCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('성공: 유효한 정보로 로그인 시 200 상태 코드와 토큰을 반환해야 합니다', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword', // bcrypt.compare가 true를 반환하도록 설정
        name: 'Test User',
      };
      const mockToken = 'mock-jwt-token';

      // 모킹된 함수의 반환 값을 설정합니다.
      userModel.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      sign.mockReturnValue(mockToken);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials);

      expect(response.status).toBe(200);
      expect(response.body.token).toBe(mockToken);
      expect(response.body.user.email).toBe(loginCredentials.email);
      expect(userModel.findByEmail).toHaveBeenCalledWith(loginCredentials.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginCredentials.password, mockUser.password);
      expect(sign).toHaveBeenCalledWith({ userId: mockUser.id, email: mockUser.email });
    });

    it('실패: 존재하지 않는 이메일로 로그인 시 401 상태 코드를 반환해야 합니다', async () => {
      userModel.findByEmail.mockResolvedValue(null); // 사용자가 없음

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('이메일 또는 비밀번호가 일치하지 않습니다');
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(sign).not.toHaveBeenCalled();
    });

    it('실패: 잘못된 비밀번호로 로그인 시 401 상태 코드를 반환해야 합니다', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
      };

      userModel.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false); // 비밀번호 불일치

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('이메일 또는 비밀번호가 일치하지 않습니다');
      expect(sign).not.toHaveBeenCalled();
    });

    it('실패: 이메일이 누락된 경우 400 상태 코드를 반환해야 합니다', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('유효한 이메일 주소를 입력해주세요');
    });

    it('실패: 비밀번호가 누락된 경우 400 상태 코드를 반환해야 합니다', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('비밀번호를 입력해주세요');
    });

    it('실패: 서버 내부 오류 발생 시 500 상태 코드를 반환해야 합니다', async () => {
        const errorMessage = 'Database connection error';
        userModel.findByEmail.mockRejectedValue(new Error(errorMessage));
  
        const response = await request(app)
          .post('/api/auth/login')
          .send(loginCredentials);
  
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('서버 오류가 발생했습니다');
      });
  });
});
