const { validationResult } = require('express-validator');
const todoModel = require('../models/todoModel');

/**
 * 할일 생성 컨트롤러
 * @param {Object} req - Express request 객체
 * @param {Object} res - Express response 객체
 */
const createTodo = async (req, res) => {
  // 1. 요청 유효성 검사
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  try {
    // 2. 데이터 추출
    const { title, is_all_day, start_date, end_date } = req.body;
    const { userId } = req.user; // 인증 미들웨어에서 설정된 사용자 ID

    // 3. 모델을 통해 데이터베이스에 할일 생성
    const newTodo = await todoModel.create({
      title,
      is_all_day,
      start_date,
      end_date,
      user_id: userId,
    });

    // 4. 성공 응답 반환
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('할일 생성 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

/**
 * 할일 목록 조회 컨트롤러
 * @param {Object} req - Express request 객체
 * @param {Object} res - Express response 객체
 */
const getTodos = async (req, res) => {
    try {
      const { userId } = req.user; // 인증 미들웨어에서 설정된 사용자 ID
  
      const todos = await todoModel.findByUserId(userId);
  
      res.status(200).json(todos);
    } catch (error) {
      console.error('할일 조회 오류:', error);
      res.status(500).json({ error: '서버 오류가 발생했습니다' });
    }
  };

/**
 * 할일 수정 컨트롤러
 * @param {Object} req - Express request 객체
 * @param {Object} res - Express response 객체
 */
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const { title, is_all_day, start_date, end_date, is_completed } = req.body;

    // 1. 할일 존재 여부 확인
    const todo = await todoModel.findById(id);
    if (!todo) {
      return res.status(404).json({ error: '존재하지 않는 할일입니다' });
    }

    // 2. 소유권 확인
    if (todo.user_id !== userId) {
      return res.status(403).json({ error: '권한이 없습니다' });
    }

    // 3. 데이터 수정
    const updatedTodo = await todoModel.update(id, { title, is_all_day, start_date, end_date, is_completed });

    res.status(200).json(updatedTodo);
  } catch (error) {
    // console.error('할일 수정 오류:', error.stack);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

/**
 * 할일 삭제 컨트롤러
 * @param {Object} req - Express request 객체
 * @param {Object} res - Express response 객체
 */
const deleteTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        // 1. 할일 존재 여부 확인
        const todo = await todoModel.findById(id);
        if (!todo) {
            return res.status(404).json({ error: '존재하지 않는 할일입니다' });
        }

        // 2. 소유권 확인
        if (todo.user_id !== userId) {
            return res.status(403).json({ error: '권한이 없습니다' });
        }

        // 3. 데이터 삭제
        await todoModel.deleteById(id);

        res.status(204).send(); // No Content
    } catch (error) {
        // console.error('할일 삭제 오류:', error.stack);
        res.status(500).json({ error: '서버 오류가 발생했습니다' });
    }
};

module.exports = {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
};
