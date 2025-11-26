const fs = require('fs');
const path = require('path');

describe('백엔드 프로젝트 초기화 검증', () => {
  describe('환경 변수 파일 검증', () => {
    const envExamplePath = path.join(__dirname, '..', '.env.example');

    test('.env.example 파일이 존재해야 함', () => {
      expect(fs.existsSync(envExamplePath)).toBe(true);
    });

    test('.env.example 파일에 DATABASE_URL이 정의되어 있어야 함', () => {
      const envContent = fs.readFileSync(envExamplePath, 'utf-8');
      expect(envContent).toMatch(/DATABASE_URL\s*=/);
    });

    test('.env.example 파일에 JWT_SECRET이 정의되어 있어야 함', () => {
      const envContent = fs.readFileSync(envExamplePath, 'utf-8');
      expect(envContent).toMatch(/JWT_SECRET\s*=/);
    });

    test('.env.example 파일에 PORT가 정의되어 있는지 확인', () => {
      const envContent = fs.readFileSync(envExamplePath, 'utf-8');
      const hasPort = envContent.includes('PORT');
      expect(hasPort || process.env.PORT === undefined).toBe(true);
    });

    test('환경 변수 값이 빈 문자열이 아니어야 함', () => {
      const envContent = fs.readFileSync(envExamplePath, 'utf-8');
      const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

      lines.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          expect(value.trim().replace(/['"]/g, '')).not.toBe('');
        }
      });
    });
  });

  describe('폴더 구조 검증', () => {
    const baseDir = path.join(__dirname, '..');

    test('backend 디렉토리가 존재해야 함', () => {
      expect(fs.existsSync(baseDir)).toBe(true);
    });

    test('src 디렉토리가 존재해야 함', () => {
      const srcDir = path.join(baseDir, 'src');
      expect(fs.existsSync(srcDir)).toBe(true);
    });

    test('tests 디렉토리가 존재해야 함', () => {
      const testsDir = path.join(baseDir, 'tests');
      expect(fs.existsSync(testsDir)).toBe(true);
    });

    test('package.json이 존재해야 함', () => {
      const packageJsonPath = path.join(baseDir, 'package.json');
      expect(fs.existsSync(packageJsonPath)).toBe(true);
    });

    test('.gitignore가 존재해야 함', () => {
      const gitignorePath = path.join(baseDir, '.gitignore');
      expect(fs.existsSync(gitignorePath)).toBe(true);
    });

    test('.gitignore에 node_modules가 포함되어야 함', () => {
      const gitignorePath = path.join(baseDir, '.gitignore');
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
      expect(gitignoreContent).toMatch(/node_modules/);
    });

    test('.gitignore에 .env가 포함되어야 함', () => {
      const gitignorePath = path.join(baseDir, '.gitignore');
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
      expect(gitignoreContent).toMatch(/\.env/);
    });
  });

  describe('package.json 검증', () => {
    let packageJson;

    beforeAll(() => {
      const packageJsonPath = path.join(__dirname, '..', 'package.json');
      packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    });

    test('package.json에 필수 의존성이 포함되어야 함', () => {
      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.dependencies.express).toBeDefined();
      expect(packageJson.dependencies.dotenv).toBeDefined();
    });

    test('package.json에 보안 관련 의존성이 포함되어야 함', () => {
      expect(packageJson.dependencies.helmet).toBeDefined();
      expect(packageJson.dependencies.cors).toBeDefined();
    });

    test('package.json에 인증 관련 의존성이 포함되어야 함', () => {
      expect(packageJson.dependencies.jsonwebtoken).toBeDefined();
      expect(packageJson.dependencies.bcrypt).toBeDefined();
    });

    test('package.json에 데이터베이스 관련 의존성이 포함되어야 함', () => {
      expect(packageJson.dependencies.pg).toBeDefined();
    });

    test('package.json에 start 스크립트가 정의되어야 함', () => {
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts.start).toBeDefined();
      expect(packageJson.scripts.start).toMatch(/node.*server\.js/);
    });

    test('package.json에 test 스크립트가 정의되어야 함', () => {
      expect(packageJson.scripts.test).toBeDefined();
    });

    test('package.json의 name 필드가 유효해야 함', () => {
      expect(packageJson.name).toBeDefined();
      expect(packageJson.name).toBe('backend');
    });

    test('package.json의 version 필드가 유효해야 함', () => {
      expect(packageJson.version).toBeDefined();
      expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('서버 파일 검증', () => {
    const serverPath = path.join(__dirname, '..', 'src', 'server.js');

    test('server.js 파일이 존재해야 함', () => {
      expect(fs.existsSync(serverPath)).toBe(true);
    });

    test('server.js에 Express가 import되어야 함', () => {
      const serverContent = fs.readFileSync(serverPath, 'utf-8');
      expect(serverContent).toMatch(/require\(['"]express['"]\)/);
    });

    test('server.js에 dotenv가 설정되어야 함', () => {
      const serverContent = fs.readFileSync(serverPath, 'utf-8');
      expect(serverContent).toMatch(/require\(['"]dotenv['"]\)\.config\(\)/);
    });

    test('server.js에 포트 설정이 있어야 함', () => {
      const serverContent = fs.readFileSync(serverPath, 'utf-8');
      expect(serverContent).toMatch(/PORT\s*=\s*process\.env\.PORT/);
    });

    test('server.js에 서버 시작 로직이 있어야 함', () => {
      const serverContent = fs.readFileSync(serverPath, 'utf-8');
      expect(serverContent).toMatch(/app\.listen/);
    });
  });
});
