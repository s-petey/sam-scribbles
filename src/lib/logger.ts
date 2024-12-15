import { browser } from '$app/environment';
import { env } from '$env/dynamic/private';
import { pino, type LoggerOptions } from 'pino';
import pretty from 'pino-pretty';
import { get, readable } from 'svelte/store';

const logLevel = env?.LOG_LEVEL ?? 'info';

const pinoOptions: LoggerOptions = {
	level: logLevel,
	formatters: {
		level: (label) => {
			return { level: label.toUpperCase() };
		}
	},
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
			levelFirst: true
		}
	},
	timestamp: pino.stdTimeFunctions.isoTime
};

function makePinoLogger() {
	if (browser) {
		return pino(
			{
				browser: {
					asObject: false
				}
			},
			pretty({
				...pinoOptions
			})
		);
	} else {
		return pino(
			pretty({
				...pinoOptions
			})
		);
	}
}

const pinoLogger = readable(makePinoLogger());

const logger = get(pinoLogger);

export { logger };
