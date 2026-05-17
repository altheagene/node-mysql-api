// _helpers/config-loader.ts
export interface FileConfig {
  secret?: string;
  database?: {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
    ssl?: boolean;
  };
  smtpOptions?: any;
  emailFrom?: string;
}

export function loadFileConfig(): FileConfig {
  // Only load config.json in non-production environments
  if (process.env.NODE_ENV === 'production') {
    return {};
  }
  
  try {
    const config = require('../config.json');
    return config as FileConfig;
  } catch (error) {
    return {};
  }
}

// Also export a ready-to-use fileConfig
export const fileConfig = loadFileConfig();