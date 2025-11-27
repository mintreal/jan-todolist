const express = require('express');
const { body, validationResult } = require('express-validator');
const { createTodo, getTodos, updateTodo, deleteTodo } = require('../controllers/todoController');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/todos - 할일 목록 조회
router.get('/', auth, getTodos);

// YYYY-MM-DD 형식인지 확인하고, 오늘 이후의 날짜인지 검증하는 커스텀 밸리데이터
const isValidDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false; // 기본 형식 검사
    }
    const inputDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘 날짜의 시작으로 설정
  
    return inputDate >= today;
  };

// POST /api/todos - 할일 생성
router.post(
  '/',
  auth, // 1. 인증 미들웨어 실행
  [ // 2. 유효성 검사 미들웨어 실행
    body('title')
      .notEmpty().withMessage('제목은 비워둘 수 없습니다')
      .isLength({ max: 200 }).withMessage('제목은 200자를 초과할 수 없습니다'),
    body('due_date')
      .notEmpty().withMessage('기한은 비워둘 수 없습니다')
      .isISO8601().withMessage('유효한 날짜 형식이 아닙니다 (YYYY-MM-DD)')
      .custom(isValidDate).withMessage('과거 날짜를 선택할 수 없습니다'),
  ],
  createTodo // 3. 컨트롤러 실행
);

// PUT /api/todos/:id - 할일 수정
router.put(
    '/:id',
    auth,
    [
        body('title')
            .optional()
            .if(body('title').exists()) // Only validate if title is present
            .isLength({ max: 200 }).withMessage('제목은 200자를 초과할 수 없습니다'),
        body('due_date')
            .optional({ checkFalsy: true })
            .if(body('due_date').exists()) // Only validate if due_date is present
            .isISO8601().withMessage('유효한 날짜 형식이 아닙니다 (YYYY-MM-DD)')
            .custom(isValidDate).withMessage('과거 날짜를 선택할 수 없습니다'),
        body('is_completed')
            .optional()
            .if(body('is_completed').exists()) // Only validate if is_completed is present
            .isBoolean().withMessage('is_completed는 boolean 값이어야 합니다'),
    ],
    (req, res, next) => { // Custom middleware to check validation results
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }
        next(); // Pass control to the controller if no errors
    },
    updateTodo
);

// DELETE /api/todos/:id - 할일 삭제
router.delete(
    '/:id',
    auth,
    deleteTodo
);

module.exports = router;
