const fs = require('fs');
const path = require('path');

describe('의존성 및 보안 테스트', () => {
  let packageJson;
  let packageLock;

  beforeAll(() => {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageLockPath = path.join(__dirname, '..', 'package-lock.json');

    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    if (fs.existsSync(packageLockPath)) {
      packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf-8'));
    }
  });

  describe('필수 의존성 버전 검증', () => {
    test('Express 버전이 5.x 이상이어야 함', () => {
      expect(packageJson.dependencies.express).toBeDefined();
      const version = packageJson.dependencies.express.replace(/[\^~]/, '');
      expect(parseInt(version.split('.')[0])).toBeGreaterThanOrEqual(5);
    });

    test('dotenv가 최신 버전이어야 함', () => {
      expect(packageJson.dependencies.dotenv).toBeDefined();
      const version = packageJson.dependencies.dotenv.replace(/[\^~]/, '');
      expect(parseInt(version.split('.')[0])).toBeGreaterThanOrEqual(16);
    });

    test('helmet이 설치되어 있어야 함', () => {
      expect(packageJson.dependencies.helmet).toBeDefined();
      const version = packageJson.dependencies.helmet.replace(/[\^~]/, '');
      expect(parseInt(version.split('.')[0])).toBeGreaterThanOrEqual(7);
    });

    test('cors가 설치되어 있어야 함', () => {
      expect(packageJson.dependencies.cors).toBeDefined();
    });

    test('pg (PostgreSQL) 드라이버가 설치되어 있어야 함', () => {
      expect(packageJson.dependencies.pg).toBeDefined();
      const version = packageJson.dependencies.pg.replace(/[\^~]/, '');
      expect(parseInt(version.split('.')[0])).toBeGreaterThanOrEqual(8);
    });

    test('jsonwebtoken이 설치되어 있어야 함', () => {
      expect(packageJson.dependencies.jsonwebtoken).toBeDefined();
      const version = packageJson.dependencies.jsonwebtoken.replace(/[\^~]/, '');
      expect(parseInt(version.split('.')[0])).toBeGreaterThanOrEqual(9);
    });

    test('bcrypt가 설치되어 있어야 함', () => {
      expect(packageJson.dependencies.bcrypt).toBeDefined();
      const version = packageJson.dependencies.bcrypt.replace(/[\^~]/, '');
      expect(parseInt(version.split('.')[0])).toBeGreaterThanOrEqual(5);
    });
  });

  describe('개발 의존성 검증', () => {
    test('Jest가 설치되어 있어야 함', () => {
      expect(packageJson.devDependencies?.jest).toBeDefined();
    });

    test('Supertest가 설치되어 있어야 함', () => {
      expect(packageJson.devDependencies?.supertest).toBeDefined();
    });

    test('개발 의존성이 프로덕션 의존성과 분리되어야 함', () => {
      if (packageJson.devDependencies) {
        const devDeps = Object.keys(packageJson.devDependencies);
        const prodDeps = Object.keys(packageJson.dependencies);

        devDeps.forEach(dep => {
          expect(prodDeps).not.toContain(dep);
        });
      }
    });
  });

  describe('package-lock.json 검증', () => {
    test('package-lock.json 파일이 존재해야 함', () => {
      const packageLockPath = path.join(__dirname, '..', 'package-lock.json');
      expect(fs.existsSync(packageLockPath)).toBe(true);
    });

    test('package-lock.json 버전이 일치해야 함', () => {
      if (packageLock) {
        expect(packageLock.version).toBe(packageJson.version);
      }
    });

    test('package-lock.json에 모든 의존성이 포함되어야 함', () => {
      if (packageLock && packageLock.packages) {
        const dependencies = Object.keys(packageJson.dependencies || {});

        dependencies.forEach(dep => {
          const hasInPackages = Object.keys(packageLock.packages).some(pkg =>
            pkg.includes(dep)
          );
          expect(hasInPackages).toBe(true);
        });
      }
    });
  });

  describe('보안 관련 의존성 검증', () => {
    test('helmet이 프로덕션 의존성에 포함되어야 함', () => {
      expect(packageJson.dependencies.helmet).toBeDefined();
      expect(packageJson.devDependencies?.helmet).toBeUndefined();
    });

    test('bcrypt가 프로덕션 의존성에 포함되어야 함', () => {
      expect(packageJson.dependencies.bcrypt).toBeDefined();
      expect(packageJson.devDependencies?.bcrypt).toBeUndefined();
    });

    test('jsonwebtoken이 프로덕션 의존성에 포함되어야 함', () => {
      expect(packageJson.dependencies.jsonwebtoken).toBeDefined();
      expect(packageJson.devDependencies?.jsonwebtoken).toBeUndefined();
    });

    test('express-validator가 설치되어 있어야 함', () => {
      expect(packageJson.dependencies['express-validator']).toBeDefined();
    });
  });

  describe('의존성 임포트 테스트', () => {
    test('Express를 임포트할 수 있어야 함', () => {
      expect(() => require('express')).not.toThrow();
    });

    test('dotenv를 임포트할 수 있어야 함', () => {
      expect(() => require('dotenv')).not.toThrow();
    });

    test('helmet을 임포트할 수 있어야 함', () => {
      expect(() => require('helmet')).not.toThrow();
    });

    test('cors를 임포트할 수 있어야 함', () => {
      expect(() => require('cors')).not.toThrow();
    });

    test('pg를 임포트할 수 있어야 함', () => {
      expect(() => require('pg')).not.toThrow();
    });

    test('jsonwebtoken을 임포트할 수 있어야 함', () => {
      expect(() => require('jsonwebtoken')).not.toThrow();
    });

    test('bcrypt를 임포트할 수 있어야 함', () => {
      expect(() => require('bcrypt')).not.toThrow();
    });

    test('express-validator를 임포트할 수 있어야 함', () => {
      expect(() => require('express-validator')).not.toThrow();
    });
  });

  describe('의존성 기능 테스트', () => {
    test('Express 앱을 생성할 수 있어야 함', () => {
      const express = require('express');
      const app = express();
      expect(app).toBeDefined();
      expect(typeof app.use).toBe('function');
      expect(typeof app.listen).toBe('function');
    });

    test('helmet 미들웨어를 사용할 수 있어야 함', () => {
      const helmet = require('helmet');
      expect(typeof helmet).toBe('function');
    });

    test('cors 미들웨어를 사용할 수 있어야 함', () => {
      const cors = require('cors');
      expect(typeof cors).toBe('function');
    });

    test('bcrypt로 비밀번호를 해싱할 수 있어야 함', async () => {
      const bcrypt = require('bcrypt');
      const password = 'testPassword123';
      const hashed = await bcrypt.hash(password, 10);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(password.length);
    });

    test('JWT 토큰을 생성할 수 있어야 함', () => {
      const jwt = require('jsonwebtoken');
      const payload = { userId: 1 };
      const secret = 'test-secret';
      const token = jwt.sign(payload, secret);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    test('PostgreSQL 클라이언트를 생성할 수 있어야 함', () => {
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: 'postgresql://test:test@localhost:5432/test',
        connectionTimeoutMillis: 1000
      });

      expect(pool).toBeDefined();
      expect(typeof pool.query).toBe('function');
    });
  });

  describe('Node.js 버전 호환성 테스트', () => {
    test('Node.js 버전이 14 이상이어야 함', () => {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      expect(majorVersion).toBeGreaterThanOrEqual(14);
    });

    test('package.json에 engines 필드가 권장됨', () => {
      if (packageJson.engines) {
        expect(packageJson.engines.node).toBeDefined();
      }
    });
  });

  describe('스크립트 검증', () => {
    test('start 스크립트가 정의되어야 함', () => {
      expect(packageJson.scripts.start).toBeDefined();
      expect(packageJson.scripts.start).toContain('node');
    });

    test('test 스크립트가 정의되어야 함', () => {
      expect(packageJson.scripts.test).toBeDefined();
    });

    test('dev 스크립트가 권장됨', () => {
      if (packageJson.scripts.dev) {
        expect(typeof packageJson.scripts.dev).toBe('string');
      }
    });
  });

  describe('package.json 메타데이터 검증', () => {
    test('name 필드가 유효해야 함', () => {
      expect(packageJson.name).toBeDefined();
      expect(packageJson.name).toBe('backend');
      expect(packageJson.name).toMatch(/^[a-z0-9-]+$/);
    });

    test('version 필드가 유효한 semver 형식이어야 함', () => {
      expect(packageJson.version).toBeDefined();
      expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test('main 필드가 정의되어야 함', () => {
      expect(packageJson.main).toBeDefined();
    });

    test('type 필드가 설정되어 있어야 함', () => {
      expect(packageJson.type).toBeDefined();
      expect(['commonjs', 'module']).toContain(packageJson.type);
    });
  });
});
