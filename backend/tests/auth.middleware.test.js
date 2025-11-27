const authenticateToken = require('../src/middleware/auth');

describe('Auth Middleware', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  beforeEach(() => {
    mockRequest = { headers: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('토큰이 없는 경우 401 상태 코드와 에러 메시지를 반환해야 합니다', () => {
    authenticateToken(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Access token required' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  // 다른 인증 시나리오 (유효한 토큰, 유효하지 않은 토큰 등) 테스트는 auth.test.js에 있음
});
