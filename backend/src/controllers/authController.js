const { validationResult } = require('express-validator');
const userModel = require('../models/userModel');
const { sign } = require('../utils/jwtToken');
const bcrypt = require('bcrypt');

/**
 * 회원가입 컨트롤러
 * @param {Object} req - Express request 객체
 * @param {Object} res - Express response 객체
 */
const signup = async (req, res) => {
  // 요청 본문의 유효성 검사 결과 확인
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: errors.array()[0].msg 
    });
  }

  try {
    const { email, password, name } = req.body;

    // 이메일 중복 확인
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        error: '이미 사용 중인 이메일입니다' 
      });
    }

    // 사용자 생성
    const newUser = await userModel.create({ email, password, name });

    // JWT 토큰 생성 (userId 포함)
    const token = sign({ userId: newUser.id, email: newUser.email });

    // 성공 응답 반환
    res.status(201).json({
      token: token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ 
      error: '서버 오류가 발생했습니다' 
    });
  }
};

/**
 * 로그인 컨트롤러
 * @param {Object} req - Express request 객체
 * @param {Object} res - Express response 객체
 */
const login = async (req, res) => {
    // 1. 요청 본문 유효성 검사
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
  
    try {
      const { email, password } = req.body;
  
      // 2. 이메일로 사용자 조회
      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: '이메일 또는 비밀번호가 일치하지 않습니다' });
      }
  
      // 3. 비밀번호 검증
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: '이메일 또는 비밀번호가 일치하지 않습니다' });
      }
  
      // 4. JWT 토큰 생성
      const token = sign({ userId: user.id, email: user.email });
  
      // 5. 성공 응답 반환
      res.status(200).json({
        token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      console.error('로그인 오류:', error);
      res.status(500).json({ error: '서버 오류가 발생했습니다' });
    }
  };

module.exports = {
  signup,
  login,
};