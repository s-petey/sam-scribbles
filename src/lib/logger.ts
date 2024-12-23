import { browser } from '$app/environment';
import { env } from '$env/dynamic/private';
import { BASELIME_API_KEY, NODE_ENV } from '$env/static/private';
import { pino, type LoggerOptions } from 'pino';
import { type PrettyOptions } from 'pino-pretty';
import { get, readable } from 'svelte/store';

const logLevel = env?.LOG_LEVEL ?? 'info';

const prettyOptions: PrettyOptions = {
  colorize: true,
  levelFirst: true,
};

const pinoOptions: LoggerOptions = {
  level: logLevel,
  transport: {
    targets: [
      ...(NODE_ENV === 'production'
        ? [
            {
              target: '@baselime/pino-transport',
              options: { baselimeApiKey: BASELIME_API_KEY },
            },
          ]
        : []),
      {
        target: 'pino-pretty',
        options: prettyOptions,
      },
    ],
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

function makePinoLogger() {
  if (browser) {
    return pino({
      ...pinoOptions,
      browser: {
        asObject: false,
      },
    });
  } else {
    return pino(pinoOptions);
  }
}

const pinoLogger = readable(makePinoLogger());

const logger = get(pinoLogger);

export { logger };
