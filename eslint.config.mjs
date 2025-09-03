import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals", 
    "next/typescript",
    "@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:security/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript"
  ),
  {
    rules: {
      // TypeScript 관련 규칙
      "@typescript-eslint/no-unused-vars": ["error", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_" 
      }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/prefer-const": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      
      // React 관련 규칙
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/prop-types": "off", // TypeScript 사용 시 불필요
      "react/react-in-jsx-scope": "off", // Next.js에서 자동 import
      
      // 접근성 관련 규칙
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      
      // 보안 관련 규칙
      "security/detect-object-injection": "warn",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-unsafe-regex": "error",
      "security/detect-buffer-noassert": "error",
      "security/detect-child-process": "warn",
      "security/detect-disable-mustache-escape": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-non-literal-require": "warn",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-possible-timing-attacks": "warn",
      "security/detect-pseudoRandomBytes": "error",
      
      // Import 관련 규칙
      "import/order": ["error", {
        "groups": [
          "builtin",
          "external", 
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }],
      "import/no-unresolved": "error",
      "import/no-cycle": "error",
      "import/no-self-import": "error",
      "import/no-useless-path-segments": "error",
      
      // 일반적인 규칙
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "error",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": "error",
      "arrow-spacing": "error",
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],
      "comma-dangle": ["error", "always-multiline"],
      "quotes": ["error", "single", { "avoidEscape": true }],
      "semi": ["error", "always"],
      "indent": ["error", 2, { "SwitchCase": 1 }],
      "max-len": ["error", { 
        "code": 100, 
        "ignoreUrls": true,
        "ignoreStrings": true,
        "ignoreTemplateLiterals": true 
      }],
      
      // Next.js 관련 규칙
      "@next/next/no-img-element": "error",
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-sync-scripts": "error",
      "@next/next/no-title-in-document-head": "error",
      "@next/next/no-unwanted-polyfillio": "error",
      "@next/next/no-css-tags": "error",
      "@next/next/no-page-custom-font": "error",
    },
  },
  {
    files: ["**/*.test.{js,jsx,ts,tsx}", "**/*.spec.{js,jsx,ts,tsx}"],
    rules: {
      // 테스트 파일에서는 일부 규칙 완화
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },
  {
    files: ["**/*.config.{js,ts}", "**/jest.setup.js"],
    rules: {
      // 설정 파일에서는 일부 규칙 완화
      "@typescript-eslint/no-var-requires": "off",
      "import/no-commonjs": "off",
    },
  },
];

export default eslintConfig;
