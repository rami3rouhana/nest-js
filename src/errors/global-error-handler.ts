import { spawn } from 'child_process';
import { resolve } from 'path';

export const handleGlobalErrors = () => {
  process.on('unhandledRejection', errorHandler);
  process.on('uncaughtException', errorHandler);
};

const errorHandler = (error: Error) => {
  console.error('Error occurred:', error);
  if (process.env.NODE_ENV === 'development') {
    restartApplication();
  } else {
    process.exit(1);
  }
};

const restartApplication = () => {
  spawn(process.argv[0], [resolve(__dirname, '../main.js')], {
    detached: true,
    stdio: 'inherit',
  }).unref();
  process.exit(1);
};
