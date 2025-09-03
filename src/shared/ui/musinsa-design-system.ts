// 무신사 스타일 디자인 시스템

export const MusinsaDesignSystem = {
  // 색상 팔레트
  colors: {
    // Primary Colors (무신사 블랙)
    primary: {
      50: '#f8f9fa',
      100: '#f1f3f4',
      200: '#e8eaed',
      300: '#dadce0',
      400: '#bdc1c6',
      500: '#9aa0a6',
      600: '#80868b',
      700: '#5f6368',
      800: '#3c4043',
      900: '#202124',
      950: '#000000', // 무신사 메인 블랙
    },
    
    // Secondary Colors (무신사 그레이)
    secondary: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    
    // Accent Colors (무신사 포인트 컬러)
    accent: {
      red: '#e53e3e',
      blue: '#3182ce',
      green: '#38a169',
      yellow: '#d69e2e',
      purple: '#805ad5',
      pink: '#d53f8c',
    },
    
    // Status Colors
    status: {
      success: '#38a169',
      warning: '#d69e2e',
      error: '#e53e3e',
      info: '#3182ce',
    },
  },
  
  // 타이포그래피
  typography: {
    // Font Families
    fontFamily: {
      sans: ['Pretendard', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    
    // Font Sizes (무신사 스타일)
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    
    // Font Weights
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    
    // Line Heights
    lineHeight: {
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },
  
  // 간격 시스템
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
  },
  
  // 보더 반경
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  // 그림자
  boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },
  
  // 애니메이션
  animation: {
    // Duration
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    
    // Easing
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
    
    // Keyframes
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      fadeOut: {
        '0%': { opacity: '1' },
        '100%': { opacity: '0' },
      },
      slideIn: {
        '0%': { transform: 'translateY(-100%)' },
        '100%': { transform: 'translateY(0)' },
      },
      slideOut: {
        '0%': { transform: 'translateY(0)' },
        '100%': { transform: 'translateY(-100%)' },
      },
      scaleIn: {
        '0%': { transform: 'scale(0.95)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
      scaleOut: {
        '0%': { transform: 'scale(1)', opacity: '1' },
        '100%': { transform: 'scale(0.95)', opacity: '0' },
      },
    },
  },
  
  // 브레이크포인트
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Z-Index
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
};

// 무신사 스타일 컴포넌트 클래스
export const MusinsaStyles = {
  // 버튼 스타일
  button: {
    primary: 'bg-black text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200',
  },
  
  // 카드 스타일
  card: {
    base: 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden',
    hover: 'hover:shadow-md transition-shadow duration-200',
    interactive: 'cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1',
  },
  
  // 입력 필드 스타일
  input: {
    base: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200',
    error: 'border-red-500 focus:ring-red-500',
    success: 'border-green-500 focus:ring-green-500',
  },
  
  // 배지 스타일
  badge: {
    base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    primary: 'bg-black text-white',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  },
  
  // 모달 스타일
  modal: {
    overlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
    content: 'bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6',
    header: 'flex items-center justify-between mb-4',
    title: 'text-lg font-semibold text-gray-900',
    close: 'text-gray-400 hover:text-gray-600 transition-colors duration-200',
  },
  
  // 네비게이션 스타일
  nav: {
    base: 'bg-white border-b border-gray-200',
    item: 'px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200',
    active: 'bg-gray-100 text-gray-900',
  },
  
  // 탭 스타일
  tab: {
    base: 'px-4 py-2 text-sm font-medium border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 transition-colors duration-200',
    active: 'text-gray-900 border-gray-900',
  },
  
  // 로딩 스타일
  loading: {
    spinner: 'animate-spin rounded-full border-2 border-gray-300 border-t-gray-900',
    skeleton: 'animate-pulse bg-gray-200 rounded',
  },
  
  // 에러 스타일
  error: {
    container: 'bg-red-50 border border-red-200 rounded-md p-4',
    title: 'text-sm font-medium text-red-800',
    message: 'text-sm text-red-700 mt-1',
  },
  
  // 성공 스타일
  success: {
    container: 'bg-green-50 border border-green-200 rounded-md p-4',
    title: 'text-sm font-medium text-green-800',
    message: 'text-sm text-green-700 mt-1',
  },
};
