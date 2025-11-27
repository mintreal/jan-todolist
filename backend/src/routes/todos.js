const express = require('express');
const { body, validationResult } = require('express-validator');
const { createTodo, getTodos, updateTodo, deleteTodo } = require('../controllers/todoController');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/todos - 할일 목록 조회
router.get('/', auth, getTodos);

const isValidDateTime = (value) => {
    const inputDate = new Date(value);
    const now = new Date();
    return inputDate >= now;
  };

// POST /api/todos - 할일 생성
router.post(
  '/',
  auth, // 1. 인증 미들웨어 실행
  [ // 2. 유효성 검사 미들웨어 실행
    body('title')
      .notEmpty().withMessage('제목은 비워둘 수 없습니다')
      .isLength({ max: 200 }).withMessage('제목은 200자를 초과할 수 없습니다'),
    body('is_all_day')
      .isBoolean().withMessage('하루종일 여부는 boolean 값이어야 합니다'),
    body('start_date')
      .notEmpty().withMessage('시작 날짜는 비워둘 수 없습니다')
      .isISO8601().withMessage('유효한 날짜 형식이 아닙니다'),
    body('end_date')
      .notEmpty().withMessage('종료 날짜는 비워둘 수 없습니다')
      .isISO8601().withMessage('유효한 날짜 형식이 아닙니다')
      .custom((endDate, { req }) => {
        if (new Date(endDate) <= new Date(req.body.start_date)) {
          throw new Error('종료 날짜는 시작 날짜보다 이후여야 합니다');
        }
        return true;
      }),
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
            .if(body('title').exists())
            .isLength({ max: 200 }).withMessage('제목은 200자를 초과할 수 없습니다'),
        body('is_all_day')
            .optional()
            .if(body('is_all_day').exists())
            .isBoolean().withMessage('하루종일 여부는 boolean 값이어야 합니다'),
        body('start_date')
            .optional()
            .if(body('start_date').exists())
            .isISO8601().withMessage('유효한 날짜 형식이 아닙니다'),
        body('end_date')
            .optional()
            .if(body('end_date').exists())
            .isISO8601().withMessage('유효한 날짜 형식이 아닙니다')
            .custom((endDate, { req }) => {
                if (req.body.start_date && new Date(endDate) <= new Date(req.body.start_date)) {
                    throw new Error('종료 날짜는 시작 날짜보다 이후여야 합니다');
                }
                return true;
            }),
        body('is_completed')
            .optional()
            .if(body('is_completed').exists())
            .isBoolean().withMessage('is_completed는 boolean 값이어야 합니다'),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }
        next();
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
