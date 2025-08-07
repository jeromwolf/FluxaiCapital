// Global type definitions for FLUX AI Capital

// Environment variable types
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Application
      NEXT_PUBLIC_APP_NAME: string;
      NEXT_PUBLIC_APP_URL: string;
      NEXT_PUBLIC_API_URL: string;

      // Supabase
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;

      // Database
      DATABASE_URL: string;
      DIRECT_URL: string;

      // Authentication
      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL: string;

      // OAuth
      GOOGLE_CLIENT_ID?: string;
      GOOGLE_CLIENT_SECRET?: string;
      KAKAO_CLIENT_ID?: string;
      KAKAO_CLIENT_SECRET?: string;

      // Market APIs
      UPBIT_ACCESS_KEY?: string;
      UPBIT_SECRET_KEY?: string;
      BINANCE_API_KEY?: string;
      BINANCE_SECRET_KEY?: string;

      // Redis
      REDIS_URL?: string;

      // Email
      SENDGRID_API_KEY?: string;
      EMAIL_FROM?: string;

      // Analytics
      NEXT_PUBLIC_GA_MEASUREMENT_ID?: string;

      // Sentry
      SENTRY_DSN?: string;
      NEXT_PUBLIC_SENTRY_DSN?: string;

      // Feature Flags
      NEXT_PUBLIC_ENABLE_TRADING?: string;
      NEXT_PUBLIC_ENABLE_AI_FEATURES?: string;
      NEXT_PUBLIC_MAINTENANCE_MODE?: string;
    }
  }
}

export {};