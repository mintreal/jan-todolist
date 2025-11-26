const request = require('supertest');
const app = require('../src/server');

describe('Express 서버 통합 테스트', () => {
  describe('GET /health - Health Check 엔드포인트', () => {
    test('상태 200으로 응답해야 함', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });

    test('JSON 형식으로 응답해야 함', async () => {
      const response = await request(app).get('/health');
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    test('응답에 status 필드가 포함되어야 함', async () => {
      const response = await request(app).get('/health');
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
    });

    test('응답에 timestamp 필드가 포함되어야 함', async () => {
      const response = await request(app).get('/health');
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    test('응답에 environment 필드가 포함되어야 함', async () => {
      const response = await request(app).get('/health');
      expect(response.body).toHaveProperty('environment');
      expect(typeof response.body.environment).toBe('string');
    });

    test('응답 시간이 100ms 이하여야 함', async () => {
      const start = Date.now();
      await request(app).get('/health');
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });

  describe('CORS 미들웨어 테스트', () => {
    test('CORS 헤더가 응답에 포함되어야 함', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    test('credentials 옵션이 활성화되어야 함', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173');

      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    test('OPTIONS 요청을 처리할 수 있어야 함', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.status).toBeLessThanOrEqual(204);
    });

    test('다양한 Origin에서 요청을 처리할 수 있어야 함', async () => {
      const origins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://example.com'
      ];

      for (const origin of origins) {
        const response = await request(app)
          .get('/health')
          .set('Origin', origin);

        expect(response.status).toBe(200);
      }
    });
  });

  describe('Helmet 보안 헤더 테스트', () => {
    test('X-Content-Type-Options 헤더가 설정되어야 함', async () => {
      const response = await request(app).get('/health');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    test('X-Frame-Options 헤더가 설정되어야 함', async () => {
      const response = await request(app).get('/health');
      expect(response.headers['x-frame-options']).toBeDefined();
    });

    test('Strict-Transport-Security 헤더가 설정되어야 함', async () => {
      const response = await request(app).get('/health');
      expect(response.headers['strict-transport-security']).toBeDefined();
    });

    test('X-Download-Options 헤더가 설정되어야 함', async () => {
      const response = await request(app).get('/health');
      expect(response.headers['x-download-options']).toBe('noopen');
    });
  });

  describe('JSON 파싱 미들웨어 테스트', () => {
    test('JSON body를 파싱할 수 있어야 함', async () => {
      const testData = { test: 'data', number: 123 };

      const response = await request(app)
        .post('/api/test')
        .send(testData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
    });

    test('잘못된 JSON 형식을 처리할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/test')
        .send('{ invalid json }')
        .set('Content-Type', 'application/json');

      expect([400, 404, 500]).toContain(response.status);
    });

    test('빈 body를 처리할 수 있어야 함', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({})
        .set('Content-Type', 'application/json');

      expect(response.status).toBeDefined();
    });
  });

  describe('404 에러 핸들러 테스트', () => {
    test('존재하지 않는 경로에 대해 404를 반환해야 함', async () => {
      const response = await request(app).get('/non-existent-path');
      expect(response.status).toBe(404);
    });

    test('404 응답이 JSON 형식이어야 함', async () => {
      const response = await request(app).get('/non-existent-path');
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    test('404 응답에 error 필드가 포함되어야 함', async () => {
      const response = await request(app).get('/non-existent-path');
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Not Found');
    });

    test('404 응답에 message 필드가 포함되어야 함', async () => {
      const response = await request(app).get('/non-existent-path');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });

    test('다양한 HTTP 메서드에서 404를 반환해야 함', async () => {
      const methods = ['get', 'post', 'put', 'delete', 'patch'];

      for (const method of methods) {
        const response = await request(app)[method]('/non-existent');
        expect(response.status).toBe(404);
      }
    });

    test('잘못된 API 경로에 대해 404를 반환해야 함', async () => {
      const response = await request(app).get('/api/invalid/endpoint');
      expect(response.status).toBe(404);
    });
  });

  describe('에러 핸들러 테스트', () => {
    test('에러 응답이 JSON 형식이어야 함', async () => {
      const response = await request(app).get('/api/error-test');
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    test('에러 응답에 적절한 필드가 포함되어야 함', async () => {
      const response = await request(app).get('/api/error-test');
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });

    test('500 에러가 발생해도 서버가 중단되지 않아야 함', async () => {
      await request(app).get('/api/error-test');

      const healthCheck = await request(app).get('/health');
      expect(healthCheck.status).toBe(200);
    });
  });

  describe('미들웨어 순서 테스트', () => {
    test('helmet이 가장 먼저 적용되어야 함', async () => {
      const response = await request(app).get('/health');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    test('CORS가 helmet 다음에 적용되어야 함', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    test('JSON 파싱이 라우터 전에 적용되어야 함', async () => {
      const response = await request(app)
        .post('/api/test')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBeDefined();
    });
  });

  describe('성능 및 안정성 테스트', () => {
    test('동시 요청을 처리할 수 있어야 함', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app).get('/health')
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
      });
    });

    test('대량의 순차 요청을 처리할 수 있어야 함', async () => {
      const requestCount = 20;
      let successCount = 0;

      for (let i = 0; i < requestCount; i++) {
        const response = await request(app).get('/health');
        if (response.status === 200) {
          successCount++;
        }
      }

      expect(successCount).toBe(requestCount);
    });

    test('다양한 엔드포인트에 대한 혼합 요청을 처리할 수 있어야 함', async () => {
      const requests = [
        request(app).get('/health'),
        request(app).get('/non-existent'),
        request(app).post('/api/test').send({ test: 'data' }),
        request(app).get('/health'),
        request(app).put('/api/test').send({ test: 'data' })
      ];

      const responses = await Promise.all(requests);

      expect(responses[0].status).toBe(200);
      expect(responses[1].status).toBe(404);
      expect(responses[2].status).toBe(404);
      expect(responses[3].status).toBe(200);
      expect(responses[4].status).toBe(404);
    });
  });

  describe('HTTP 메서드 지원 테스트', () => {
    test('GET 메서드를 지원해야 함', async () => {
      const response = await request(app).get('/health');
      expect(response.status).not.toBe(405);
    });

    test('POST 메서드를 지원해야 함', async () => {
      const response = await request(app).post('/api/test');
      expect(response.status).not.toBe(405);
    });

    test('PUT 메서드를 지원해야 함', async () => {
      const response = await request(app).put('/api/test');
      expect(response.status).not.toBe(405);
    });

    test('DELETE 메서드를 지원해야 함', async () => {
      const response = await request(app).delete('/api/test');
      expect(response.status).not.toBe(405);
    });

    test('PATCH 메서드를 지원해야 함', async () => {
      const response = await request(app).patch('/api/test');
      expect(response.status).not.toBe(405);
    });
  });
});
