export const logger = {
  error: (message: string, error?: unknown) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(message, error);
    }
  },
  warn: (message: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(message, data);
    }
  },
  info: (message: string, data?: unknown) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(message, data);
    }
  },
};
