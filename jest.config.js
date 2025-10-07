const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Next.js 앱의 경로를 제공
  dir: './',
});

// Jest에 추가할 사용자 정의 설정
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/', 
    '<rootDir>/node_modules/',
    '<rootDir>/e2e-tests/', // E2E 테스트는 Playwright에서 실행
    '<rootDir>/scripts/', // 스크립트 파일 제외
    '<rootDir>/playwright.config.js', // Playwright 설정 파일 제외
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

// createJestConfig는 next/jest가 비동기적으로 Next.js 구성을 로드할 수 있도록 하는 방식으로 내보내집니다.
module.exports = createJestConfig(customJestConfig);
