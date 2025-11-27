const express = require('express');
const { body } = require('express-validator');
const { signup, login } = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/signup - 회원가입
router.post(
  '/signup',
  // 입력 검증
  body('email').isEmail().withMessage('유효한 이메일 주소를 입력해주세요'),
  body('password').isLength({ min: 8 }).withMessage('비밀번호는 최소 8자 이상이어야 합니다'),
  body('name').notEmpty().withMessage('이름을 입력해주세요'),
  signup
);

// POST /api/auth/register - 회원가입 (signup과 동일한 기능)
router.post(
  '/register',
  // 입력 검증
  body('email').isEmail().withMessage('유효한 이메일 주소를 입력해주세요'),
  body('password').isLength({ min: 8 }).withMessage('비밀번호는 최소 8자 이상이어야 합니다'),
  body('name').notEmpty().withMessage('이름을 입력해주세요'),
  signup
);

// POST /api/auth/login - 로그인
router.post(
    '/login',
    // 입력 검증
    body('email').isEmail().withMessage('유효한 이메일 주소를 입력해주세요'),
    body('password').notEmpty().withMessage('비밀번호를 입력해주세요'),
    login
);

module.exports = router;