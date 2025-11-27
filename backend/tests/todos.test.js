const request = require('supertest');
let app; // Defer app import
const todoModel = require('../src/models/todoModel');
const { sign } = require('../src/utils/jwtToken');
const { pool } = require('../src/config/database'); // Import pool

// todoModel만 모킹합니다. 인증은 실제 토큰으로 테스트합니다.
jest.mock('../src/models/todoModel', () => ({
  create: jest.fn(),
  findByUserId: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  deleteById: jest.fn(),
}));


describe('Todos API: /api/todos', () => {
  let token;

  beforeAll(() => {
    app = require('../src/app'); // Import app here to ensure mocks are applied
    // 테스트에 사용할 유효한 토큰 생성
    const userPayload = { userId: 1, email: 'test@example.com' };
    token = sign(userPayload);
  });

  afterAll(async () => {
    await pool.end(); // Close the database pool after all tests are done
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST / - 할일 생성', () => {
    const newTodoData = {
      title: '새로운 할일',
      due_date: '2099-12-31',
    };

    it('성공: 유효한 데이터와 토큰으로 할일 생성 시 201 상태 코드와 생성된 할일을 반환해야 합니다', async () => {
      const createdTodo = { id: 1, user_id: 1, ...newTodoData, is_completed: false };
      todoModel.create.mockResolvedValue(createdTodo);

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`) // 인증 헤더 추가
        .send(newTodoData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdTodo);
      expect(todoModel.create).toHaveBeenCalledWith({
        ...newTodoData,
        user_id: 1, // 토큰 페이로드에서 추출된 userId
      });
    });

    it('성공: due_date 없이 title만으로 할일 생성 시 201 상태 코드를 반환해야 합니다', async () => {
        const todoDataWithoutDate = { title: '기한 없는 할일' };
        const createdTodo = { id: 2, user_id: 1, ...todoDataWithoutDate, due_date: null, is_completed: false };
        todoModel.create.mockResolvedValue(createdTodo);
  
        const response = await request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${token}`)
          .send(todoDataWithoutDate);
  
        expect(response.status).toBe(201);
        expect(response.body).toEqual(createdTodo);
        expect(todoModel.create).toHaveBeenCalledWith({
            title: todoDataWithoutDate.title,
            due_date: null,
            user_id: 1,
        });
      });

    it('실패: title이 누락된 경우 400 상태 코드를 반환해야 합니다', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ due_date: '2099-12-31' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('제목은 비워둘 수 없습니다');
    });

    it('실패: title이 200자를 초과하는 경우 400 상태 코드를 반환해야 합니다', async () => {
        const longTitle = 'a'.repeat(201);
        const response = await request(app)
          .post('/api/todos')
          .set('Authorization', `Bearer ${token}`)
          .send({ ...newTodoData, title: longTitle });
  
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('제목은 200자를 초과할 수 없습니다');
      });

    it('실패: due_date가 유효하지 않은 날짜 형식인 경우 400 상태 코드를 반환해야 합니다', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...newTodoData, due_date: 'invalid-date' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('유효한 날짜 형식이 아닙니다');
    });

    it('실패: due_date가 과거 날짜인 경우 400 상태 코드를 반환해야 합니다', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...newTodoData, due_date: '2000-01-01' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('과거 날짜를 선택할 수 없습니다');
    });

    it('실패: 데이터베이스 오류 발생 시 500 상태 코드를 반환해야 합니다', async () => {
      todoModel.create.mockRejectedValue(new Error('DB 오류'));

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send(newTodoData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('서버 오류가 발생했습니다');
    });
  });

  describe('GET / - 할일 목록 조회', () => {
    it('성공: 유효한 토큰으로 요청 시 200 상태 코드와 할일 목록을 반환해야 합니다', async () => {
      const mockTodos = [
        { id: 1, title: 'Todo 1', user_id: 1 },
        { id: 2, title: 'Todo 2', user_id: 1 },
      ];
      todoModel.findByUserId.mockResolvedValue(mockTodos);

      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTodos);
      expect(todoModel.findByUserId).toHaveBeenCalledWith(1); // userId from token
    });

    it('성공: 할일이 없는 경우 200 상태 코드와 빈 배열을 반환해야 합니다', async () => {
      todoModel.findByUserId.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });



    it('실패: 데이터베이스 오류 발생 시 500 상태 코드를 반환해야 합니다', async () => {
      todoModel.findByUserId.mockRejectedValue(new Error('DB 조회 오류'));

      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('서버 오류가 발생했습니다');
    });
  });

  describe('PUT /:id - 할일 수정', () => {
    let anotherToken;
    beforeAll(() => {
        const anotherUserPayload = { userId: 2, email: 'another@example.com' };
        anotherToken = sign(anotherUserPayload);
    });

    it('성공: 유효한 데이터로 할일 제목을 수정해야 합니다', async () => {
      const todoId = 1;
      const originalTodo = { id: todoId, user_id: 1, title: 'Original Title', due_date: null, is_completed: false, updated_at: '2023-01-01T00:00:00Z' };
      const updatedData = { title: 'Updated Title' };
      const expectedTodo = { ...originalTodo, ...updatedData, updated_at: expect.any(String) };

      todoModel.findById.mockResolvedValue(originalTodo);
      // todoModel.update 모의 반환 값에는 실제 문자열을 사용
      todoModel.update.mockResolvedValue({ ...originalTodo, ...updatedData, updated_at: '2023-01-01T00:00:00Z' });

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      // 응답 본문 검증 시에는 expect.any(String)을 사용
      expect(response.body).toEqual({ ...originalTodo, ...updatedData, updated_at: expect.any(String) });
      expect(todoModel.findById).toHaveBeenCalledWith(String(todoId));
      expect(todoModel.update).toHaveBeenCalledWith(todoId, updatedData);
    });

    it('성공: 유효한 데이터로 할일 기한을 수정해야 합니다', async () => {
      const todoId = 1;
      const originalTodo = { id: todoId, user_id: 1, title: 'Original Title', due_date: null, is_completed: false, updated_at: '2023-01-01T00:00:00Z' };
      const updatedData = { due_date: '2099-12-25' };
      const expectedTodo = { ...originalTodo, ...updatedData, updated_at: expect.any(String) };

      todoModel.findById.mockResolvedValue(originalTodo);
      // todoModel.update 모의 반환 값에는 실제 문자열을 사용
      todoModel.update.mockResolvedValue({ ...originalTodo, ...updatedData, updated_at: '2023-01-01T00:00:00Z' });

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      // 응답 본문 검증 시에는 expect.any(String)을 사용
      expect(response.body).toEqual({ ...originalTodo, ...updatedData, updated_at: expect.any(String) });
      expect(todoModel.findById).toHaveBeenCalledWith(String(todoId));
      expect(todoModel.update).toHaveBeenCalledWith(todoId, updatedData);
    });

    it('성공: 유효한 데이터로 할일 완료 상태를 수정해야 합니다', async () => {
      const todoId = 1;
      const originalTodo = { id: todoId, user_id: 1, title: 'Original Title', due_date: null, is_completed: false, updated_at: '2023-01-01T00:00:00Z' };
      const updatedData = { is_completed: true };
      const expectedTodo = { ...originalTodo, ...updatedData, updated_at: expect.any(String) };

      todoModel.findById.mockResolvedValue(originalTodo);
      // todoModel.update 모의 반환 값에는 실제 문자열을 사용
      todoModel.update.mockResolvedValue({ ...originalTodo, ...updatedData, updated_at: '2023-01-01T00:00:00Z' });

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      // 응답 본문 검증 시에는 expect.any(String)을 사용
      expect(response.body).toEqual({ ...originalTodo, ...updatedData, updated_at: expect.any(String) });
      expect(todoModel.findById).toHaveBeenCalledWith(String(todoId));
      expect(todoModel.update).toHaveBeenCalledWith(todoId, updatedData);
    });

    it('성공: 여러 필드를 동시에 수정해야 합니다', async () => {
      const todoId = 1;
      const originalTodo = { id: todoId, user_id: 1, title: 'Original Title', due_date: null, is_completed: false, updated_at: '2023-01-01T00:00:00Z' };
      const updatedData = { title: 'Multiple Fields Update', due_date: '2099-12-24', is_completed: true };
      const expectedTodo = { ...originalTodo, ...updatedData, updated_at: expect.any(String) };

      todoModel.findById.mockResolvedValue(originalTodo);
      // todoModel.update 모의 반환 값에는 실제 문자열을 사용
      todoModel.update.mockResolvedValue({ ...originalTodo, ...updatedData, updated_at: '2023-01-01T00:00:00Z' });

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      // 응답 본문 검증 시에는 expect.any(String)을 사용
      expect(response.body).toEqual({ ...originalTodo, ...updatedData, updated_at: expect.any(String) });
      expect(todoModel.findById).toHaveBeenCalledWith(String(todoId));
      expect(todoModel.update).toHaveBeenCalledWith(todoId, updatedData);
    });

    it('실패: 인증 토큰이 없는 경우 401 상태 코드를 반환해야 합니다', async () => {
      const todoId = 1;
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ title: 'Unauthorized' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });

    it('실패: 존재하지 않는 할일 수정 시 404 상태 코드를 반환해야 합니다', async () => {
      const todoId = 999;
      todoModel.findById.mockResolvedValue(null);

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Not Found' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('존재하지 않는 할일입니다');
      expect(todoModel.findById).toHaveBeenCalledWith(String(todoId));
    });

    it('실패: 다른 사용자의 할일 수정 시 403 상태 코드를 반환해야 합니다', async () => {
      const todoId = 1;
      const originalTodo = { id: todoId, user_id: 1, title: 'Original Title', due_date: null, is_completed: false };
      todoModel.findById.mockResolvedValue(originalTodo);

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${anotherToken}`) // 다른 사용자 토큰 사용
        .send({ title: 'Forbidden Update' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('권한이 없습니다');
      expect(todoModel.findById).toHaveBeenCalledWith(String(todoId));
    });

    it('실패: title이 200자를 초과하는 경우 400 상태 코드를 반환해야 합니다', async () => {
      const todoId = 1;
      const originalTodo = { id: todoId, user_id: 1, title: 'Original Title', due_date: null, is_completed: false };
      todoModel.findById.mockResolvedValue(originalTodo); // findById는 통과하도록
      todoModel.update.mockResolvedValue({ ...originalTodo, title: 'a'.repeat(201) }); // update는 목킹 안함, 밸리데이션 테스트

      const longTitle = 'a'.repeat(201);
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: longTitle });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('제목은 200자를 초과할 수 없습니다');
    });

    it('실패: due_date가 유효하지 않은 형식인 경우 400 상태 코드를 반환해야 합니다', async () => {
      const todoId = 1;
      const originalTodo = { id: todoId, user_id: 1, title: 'Original Title', due_date: null, is_completed: false };
      todoModel.findById.mockResolvedValue(originalTodo);

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ due_date: 'invalid-date' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('유효한 날짜 형식이 아닙니다');
    });

    it('실패: due_date가 과거 날짜인 경우 400 상태 코드를 반환해야 합니다', async () => {
      const todoId = 1;
      const originalTodo = { id: todoId, user_id: 1, title: 'Original Title', due_date: null, is_completed: false };
      todoModel.findById.mockResolvedValue(originalTodo);

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ due_date: '2000-01-01' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('과거 날짜를 선택할 수 없습니다');
    });

    it('실패: is_completed가 boolean이 아닌 경우 400 상태 코드를 반환해야 합니다', async () => {
      const todoId = 1;
      const originalTodo = { id: todoId, user_id: 1, title: 'Original Title', due_date: null, is_completed: false };
      todoModel.findById.mockResolvedValue(originalTodo);

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ is_completed: 'not-boolean' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('is_completed는 boolean 값이어야 합니다');
    });

    it('실패: 데이터베이스 오류 발생 시 500 상태 코드를 반환해야 합니다', async () => {
      const todoId = 1;
      const originalTodo = { id: todoId, user_id: 1, title: 'Original Title', due_date: null, is_completed: false };
      todoModel.findById.mockResolvedValue(originalTodo);
      todoModel.update.mockRejectedValue(new Error('DB Update Error'));

      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Trigger DB Error' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('서버 오류가 발생했습니다');
    });
  });

  describe('DELETE /:id - 할일 삭제', () => {
    let anotherToken;
    beforeAll(() => {
        const anotherUserPayload = { userId: 2, email: 'another@example.com' };
        anotherToken = sign(anotherUserPayload);
    });

    it('성공: 유효한 토큰으로 할일 삭제 시 204 상태 코드를 반환해야 합니다', async () => {
      const todoId = 1;
      const originalTodo = { id: todoId, user_id: 1, title: 'Todo to Delete' };
      todoModel.findById.mockResolvedValue(originalTodo);
      todoModel.deleteById.mockResolvedValue({ rowCount: 1 });

      const response = await request(app)
        .delete(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(204);
      expect(response.body).toEqual({}); // 204 No Content는 응답 본문이 비어있음
      expect(todoModel.findById).toHaveBeenCalledWith(String(todoId));
      expect(todoModel.deleteById).toHaveBeenCalledWith(String(todoId));
    });



    it('실패: 존재하지 않는 할일 삭제 시 404 상태 코드를 반환해야 합니다', async () => {
      const todoId = 999;
      todoModel.findById.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('존재하지 않는 할일입니다');
      expect(todoModel.findById).toHaveBeenCalledWith(String(todoId));
    });

    it('실패: 다른 사용자의 할일 삭제 시 403 상태 코드를 반환해야 합니다', async () => {
      const todoId = 1;
      const originalTodo = { id: todoId, user_id: 1, title: 'Todo to Delete' };
      todoModel.findById.mockResolvedValue(originalTodo);

      const response = await request(app)
        .delete(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${anotherToken}`); // 다른 사용자 토큰 사용

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('권한이 없습니다');
      expect(todoModel.findById).toHaveBeenCalledWith(String(todoId));
    });

    it('실패: 데이터베이스 오류 발생 시 500 상태 코드를 반환해야 합니다', async () => {
      const todoId = 1;
      const originalTodo = { id: todoId, user_id: 1, title: 'Todo to Delete' };
      todoModel.findById.mockResolvedValue(originalTodo);
      todoModel.deleteById.mockRejectedValue(new Error('DB Delete Error'));

      const response = await request(app)
        .delete(`/api/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('서버 오류가 발생했습니다');
    });
  });
});




