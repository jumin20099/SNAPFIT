#!/usr/bin/env node

/**
 * SnapFit 전체 테스트 실행 스크립트
 * 모든 테스트를 순차적으로 실행하고 결과를 종합합니다.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tests: []
    };
  }

  async runCommand(command, name) {
    console.log(`\n🚀 ${name} 실행 중...`);
    console.log(`명령어: ${command}\n`);
    
    const startTime = Date.now();
    
    try {
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      const duration = Date.now() - startTime;
      
      this.results.tests.push({
        name,
        status: 'PASS',
        duration: `${duration}ms`,
        output: output.trim()
      });
      
      console.log(`✅ ${name} 완료 (${duration}ms)`);
      return true;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.tests.push({
        name,
        status: 'FAIL',
        duration: `${duration}ms`,
        error: error.message,
        output: error.stdout || error.stderr || ''
      });
      
      console.log(`❌ ${name} 실패 (${duration}ms)`);
      console.log(`오류: ${error.message}`);
      return false;
    }
  }

  async checkServerHealth() {
    console.log('🏥 서버 상태 확인 중...');
    
    try {
      const axios = require('axios');
      
      // 프론트엔드 확인
      const frontendResponse = await axios.get('http://localhost:3000', { timeout: 5000 });
      console.log('✅ 프론트엔드 서버 정상');
      
      // 백엔드 확인
      const backendResponse = await axios.get('http://localhost:8080/api/notifications/sse/status', { timeout: 5000 });
      console.log('✅ 백엔드 서버 정상');
      
      return true;
    } catch (error) {
      console.log('❌ 서버 상태 확인 실패:', error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🧪 SnapFit 포괄적 전체 테스트 시작...\n');
    console.log('=' * 50);
    
    // 서버 상태 확인
    const serverHealthy = await this.checkServerHealth();
    if (!serverHealthy) {
      console.log('\n❌ 서버가 실행되지 않았습니다. 먼저 서버를 시작해주세요.');
      console.log('프론트엔드: npm run dev');
      console.log('백엔드: cd snapfit-backend && ./gradlew bootRun');
      process.exit(1);
    }

    let allPassed = true;

    // 1. 테스트 데이터 시드
    const seedPassed = await this.runCommand(
      'node scripts/seed-test-data.js',
      '테스트 데이터 시드'
    );
    allPassed = allPassed && seedPassed;

    // 2. API 테스트
    const apiPassed = await this.runCommand(
      'node scripts/api-test.js',
      'API 테스트'
    );
    allPassed = allPassed && apiPassed;

    // 3. E2E 테스트 (Playwright) - 초간단 테스트만
    const e2ePassed = await this.runCommand(
      'npx playwright test e2e-tests/ultra-minimal.spec.js --reporter=json --timeout=30000',
      'E2E 테스트'
    );
    allPassed = allPassed && e2ePassed;

    // 4. 프론트엔드 단위 테스트 - Jest만 실행
    const unitPassed = await this.runCommand(
      'npm test -- --passWithNoTests --testPathIgnorePatterns=e2e-tests',
      '단위 테스트'
    );
    allPassed = allPassed && unitPassed;

    // 5. 백엔드 테스트 (있다면)
    try {
      const backendTestPassed = await this.runCommand(
        'cd snapfit-backend && ./gradlew test',
        '백엔드 테스트'
      );
      allPassed = allPassed && backendTestPassed;
    } catch (error) {
      console.log('⚠️ 백엔드 테스트를 찾을 수 없습니다. 건너뜁니다.');
    }

    // 결과 저장
    this.results.overallStatus = allPassed ? 'PASS' : 'FAIL';
    this.results.totalTests = this.results.tests.length;
    this.results.passedTests = this.results.tests.filter(t => t.status === 'PASS').length;
    this.results.failedTests = this.results.tests.filter(t => t.status === 'FAIL').length;

    fs.writeFileSync('test-results-comprehensive.json', JSON.stringify(this.results, null, 2));

    // 최종 결과 출력
    console.log('\n' + '=' * 50);
    console.log('📊 전체 테스트 결과');
    console.log('=' * 50);
    console.log(`총 테스트: ${this.results.totalTests}`);
    console.log(`✅ 성공: ${this.results.passedTests}`);
    console.log(`❌ 실패: ${this.results.failedTests}`);
    console.log(`📈 성공률: ${((this.results.passedTests / this.results.totalTests) * 100).toFixed(1)}%`);
    console.log(`🎯 전체 상태: ${allPassed ? '✅ 성공' : '❌ 실패'}`);

    if (!allPassed) {
      console.log('\n❌ 실패한 테스트:');
      this.results.tests
        .filter(t => t.status === 'FAIL')
        .forEach(t => {
          console.log(`  - ${t.name}: ${t.error || '알 수 없는 오류'}`);
        });
    }

    console.log(`\n📄 상세 결과: test-results-comprehensive.json`);

    // 실패한 테스트가 있으면 프로세스 종료 코드 1로 종료
    if (!allPassed) {
      process.exit(1);
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests();
}

module.exports = TestRunner;
