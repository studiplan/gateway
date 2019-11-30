import { Container, transports, config, format } from 'winston';

const  { combine, colorize, printf, label, timestamp } = format;

enum Logger {
    GATEWAY = 'GATEWAY',
    SESSION = 'SESSION',
    GQLYOGA = 'GQLYOGA',
}

const defaultFormat = combine(
    colorize(),
    timestamp(),
    printf(info => `${info.level}@${info.timestamp} [${info.label}]: ${info.message}`),
);

const container = new Container({
    levels: config.syslog.levels,
    format: defaultFormat,
    transports: [
        new transports.Console(),
    ]
});

container.add(Logger.GATEWAY, {
    level: process.env.LOG_LEVEL_GATEWAY,
	format: combine(
        label({ label: Logger.GATEWAY }),
        defaultFormat
    ),
    transports: [
        new transports.Console(),
    ]
});

container.add(Logger.SESSION, {
    level: process.env.LOG_LEVEL_SESSION,
	format: combine(
        colorize(),
		timestamp(),
		label({ label: Logger.SESSION }),
		printf(info => `${info.level}@${info.timestamp} [${info.label}|${info.uuid}]: ${info.message}`),
    ),
    transports: [
        new transports.Console(),
    ]
});

container.add(Logger.GQLYOGA, {
    level: process.env.LOG_LEVEL_GQLYOGA,
	format: combine(
		label({ label: Logger.GQLYOGA }),
        defaultFormat
    ),
    transports: [
        new transports.Console(),
    ]
});

const gatewayLog = container.get(Logger.GATEWAY);
const sessionLog = container.get(Logger.SESSION);
const gqlyogaLog = container.get(Logger.GQLYOGA);

export { gatewayLog, sessionLog, gqlyogaLog };