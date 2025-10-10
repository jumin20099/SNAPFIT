#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 수정할 파일 목록
const files = [
  'app/admin/products/add/page.tsx',
  'app/admin/partner-applications/page.tsx', 
  'app/admin/product-approvals/page.tsx',
  'app/partner-products/page.tsx',
  'app/community/[id]/page.tsx',
  'app/community/page.tsx',
  'app/community/create/page.tsx'
];

// localStorage 패턴들
const patterns = [
  {
    // localStorage.getItem('token') 제거
    regex: /const\s+token\s*=\s*localStorage\.getItem\(['"']token['""]\)\s*;?\s*\n/g,
    replacement: '// HttpOnly 쿠키를 사용하므로 클라이언트에서 토큰 검증 불가\n// 서버에서 자동으로 인증 처리\n'
  },
  {
    // Authorization 헤더 제거하고 credentials 추가
    regex: /headers:\s*\{\s*['"']Authorization['""]:\s*`Bearer\s*\$\{token\}`[^}]*\}/g,
    replacement: 'credentials: \'include\', // HttpOnly 쿠키 자동 전송'
  },
  {
    // Authorization 헤더만 있는 경우
    regex: /headers:\s*\{\s*['"']Authorization['""]:\s*`Bearer\s*\$\{token\}`\s*\}/g,
    replacement: 'credentials: \'include\' // HttpOnly 쿠키 자동 전송'
  },
  {
    // Content-Type과 Authorization이 함께 있는 경우
    regex: /headers:\s*\{\s*['"']Content-Type['""]:\s*['"'][^'"]*['"'][^}]*['"']Authorization['""]:\s*`Bearer\s*\$\{token\}`[^}]*\}/g,
    replacement: 'headers: {\n          \'Content-Type\': \'application/json\',\n        },\n        credentials: \'include\', // HttpOnly 쿠키 자동 전송'
  }
];

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    patterns.forEach(pattern => {
      const newContent = content.replace(pattern.regex, pattern.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    } else {
      console.log(`No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// 파일들 처리
files.forEach(fixFile);

console.log('localStorage fix completed!');
