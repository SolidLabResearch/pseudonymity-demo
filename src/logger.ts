const LEVEL = 'info'; // warn info debug, ...

import { pino } from 'pino'
export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l o',
    }
  },
  level: LEVEL,
})
