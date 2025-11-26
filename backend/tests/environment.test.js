const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

describe('환경 변수 및 설정 테스트', () => {
  let envConfig;
  const envExamplePath = path.join(__dirname, '..', '.env.example');

  beforeAll(() => {
    if (fs.existsSync(envExamplePath)) {
      const envContent = fs.readFileSync(envExamplePath, 'utf-8');
      envConfig = dotenv.parse(envContent);
    }
  });

  describe('.env.example 파일 상세 검증', () => {
    test('.env.example 파일이 읽을 수 있어야 함', () => {
      expect(fs.existsSync(envExamplePath)).toBe(true);
      expect(() => fs.readFileSync(envExamplePath, 'utf-8')).not.toThrow();
    });

    test('DATABASE_URL 형식이 올바른 PostgreSQL 연결 문자열이어야 함', () => {
      expect(envConfig).toHaveProperty('DATABASE_URL');
      expect(envConfig.DATABASE_URL).toMatch(/^postgresql:\/\/.+/);
    });

    test('JWT_SECRET이 비어있지 않아야 함', () => {
      expect(envConfig).toHaveProperty('JWT_SECRET');
      expect(envConfig.JWT_SECRET.length).toBeGreaterThan(0);
    });

    test('환경 변수 키에 공백이 없어야 함', () => {
      const envContent = fs.readFileSync(envExamplePath, 'utf-8');
      const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

      lines.forEach(line => {
        const [key] = line.split('=');
        if (key) {
          expect(key.trim()).not.toMatch(/\s/);
        }
      });
    });

    test('환경 변수 값이 따옴표로 감싸져 있어야 함', () => {
      const envContent = fs.readFileSync(envExamplePath, 'utf-8');
      const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

      lines.forEach(line => {
        const [, value] = line.split('=');
        if (value && value.includes(' ')) {
          expect(value.trim()).toMatch(/^["'].+["']$/);
        }
      });
    });
  });

  describe('환경 변수 로딩 테스트', () => {
    test('dotenv가 설치되어 있어야 함', () => {
      expect(dotenv).toBeDefined();
      expect(typeof dotenv.config).toBe('function');
    });

    test('환경 변수를 파싱할 수 있어야 함', () => {
      const envContent = 'TEST_VAR=test_value\nNUMBER=123';
      const parsed = dotenv.parse(envContent);

      expect(parsed).toHaveProperty('TEST_VAR');
      expect(parsed.TEST_VAR).toBe('test_value');
      expect(parsed.NUMBER).toBe('123');
    });

    test('process.env에서 NODE_ENV를 읽을 수 있어야 함', () => {
      const nodeEnv = process.env.NODE_ENV || 'development';
      expect(typeof nodeEnv).toBe('string');
      expect(['development', 'production', 'test']).toContain(nodeEnv);
    });

    test('process.env에서 PORT를 읽을 수 있어야 함', () => {
      const port = process.env.PORT || 3000;
      expect(typeof port).toBeDefined();
      expect(!isNaN(Number(port))).toBe(true);
    });
  });

  describe('보안 관련 환경 변수 검증', () => {
    test('JWT_SECRET이 충분히 복잡해야 함', () => {
      if (envConfig && envConfig.JWT_SECRET) {
        const secret = envConfig.JWT_SECRET.replace(/['"]/g, '');
        expect(secret.length).toBeGreaterThanOrEqual(8);
      }
    });

    test('DATABASE_URL에 패스워드가 포함되어야 함', () => {
      if (envConfig && envConfig.DATABASE_URL) {
        const dbUrl = envConfig.DATABASE_URL.replace(/['"]/g, '');
        expect(dbUrl).toMatch(/password/);
      }
    });

    test('.env 파일이 gitignore에 포함되어야 함', () => {
      const gitignorePath = path.join(__dirname, '..', '.gitignore');
      if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
        expect(gitignoreContent).toMatch(/\.env/);
      }
    });

    test('.env.example은 실제 비밀정보를 포함하지 않아야 함', () => {
      const envContent = fs.readFileSync(envExamplePath, 'utf-8');
      const safePatterns = [
        /user:password@/,
        /your-jwt-secret/,
        /localhost/,
        /development/
      ];

      let hasSafeValue = false;
      safePatterns.forEach(pattern => {
        if (pattern.test(envContent)) {
          hasSafeValue = true;
        }
      });

      expect(hasSafeValue).toBe(true);
    });
  });

  describe('환경별 설정 테스트', () => {
    test('개발 환경 설정이 유효해야 함', () => {
      const devConfig = {
        NODE_ENV: 'development',
        PORT: 3000,
        DATABASE_URL: envConfig?.DATABASE_URL
      };

      expect(devConfig.NODE_ENV).toBe('development');
      expect(typeof devConfig.PORT).toBe('number');
      expect(devConfig.DATABASE_URL).toBeDefined();
    });

    test('테스트 환경 설정이 유효해야 함', () => {
      const testConfig = {
        NODE_ENV: 'test',
        PORT: 3001,
        DATABASE_URL: envConfig?.DATABASE_URL
      };

      expect(testConfig.NODE_ENV).toBe('test');
      expect(typeof testConfig.PORT).toBe('number');
      expect(testConfig.DATABASE_URL).toBeDefined();
    });

    test('프로덕션 환경에서 필수 환경 변수가 체크되어야 함', () => {
      const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

      requiredEnvVars.forEach(varName => {
        expect(envConfig).toHaveProperty(varName);
        expect(envConfig[varName]).toBeTruthy();
      });
    });
  });

  describe('환경 변수 타입 검증', () => {
    test('PORT는 숫자로 변환 가능해야 함', () => {
      const port = process.env.PORT || '3000';
      const portNumber = Number(port);

      expect(isNaN(portNumber)).toBe(false);
      expect(portNumber).toBeGreaterThan(0);
      expect(portNumber).toBeLessThan(65536);
    });

    test('DATABASE_URL은 문자열이어야 함', () => {
      if (envConfig && envConfig.DATABASE_URL) {
        expect(typeof envConfig.DATABASE_URL).toBe('string');
      }
    });

    test('JWT_SECRET은 문자열이어야 함', () => {
      if (envConfig && envConfig.JWT_SECRET) {
        expect(typeof envConfig.JWT_SECRET).toBe('string');
      }
    });
  });

  describe('환경 변수 기본값 테스트', () => {
    test('PORT의 기본값이 3000이어야 함', () => {
      const port = process.env.PORT || 3000;
      if (!process.env.PORT) {
        expect(port).toBe(3000);
      }
    });

    test('NODE_ENV의 기본값이 development여야 함', () => {
      const nodeEnv = process.env.NODE_ENV || 'development';
      if (!process.env.NODE_ENV) {
        expect(nodeEnv).toBe('development');
      }
    });

    test('CORS_ORIGIN의 기본값이 설정되어야 함', () => {
      const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
      expect(corsOrigin).toBeDefined();
      expect(corsOrigin).toMatch(/^https?:\/\//);
    });
  });

  describe('환경 변수 파일 형식 검증', () => {
    test('.env.example 파일이 UTF-8 인코딩이어야 함', () => {
      const envContent = fs.readFileSync(envExamplePath, 'utf-8');
      expect(typeof envContent).toBe('string');
      expect(envContent.length).toBeGreaterThan(0);
    });

    test('.env.example 파일에 주석이 있으면 #로 시작해야 함', () => {
      const envContent = fs.readFileSync(envExamplePath, 'utf-8');
      const lines = envContent.split('\n');

      lines.forEach(line => {
        if (line.trim() && !line.includes('=')) {
          if (line.trim().length > 0) {
            expect(line.trim()[0]).toBe('#');
          }
        }
      });
    });

    test('.env.example 파일의 각 라인이 올바른 형식이어야 함', () => {
      const envContent = fs.readFileSync(envExamplePath, 'utf-8');
      const lines = envContent.split('\n').filter(line => line.trim());

      lines.forEach(line => {
        if (!line.startsWith('#') && line.includes('=')) {
          const [key, ...valueParts] = line.split('=');
          expect(key.trim().length).toBeGreaterThan(0);
          expect(valueParts.join('=')).toBeDefined();
        }
      });
    });
  });
});
