import { GraphQLServer } from 'graphql-yoga';
import neo4j from 'neo4j-driver';
import { IMiddleware } from 'graphql-middleware';
import { ContextParameters } from 'graphql-yoga/dist/types';

import { queryNode, yn, debugSession, uuid } from './helper';
import { activities, appointments } from './mocks';
import typeDefs from './typedefs/schema.gql';
import resolvers from './resolvers';
import { gatewayLog, sessionLog, gqlyogaLog } from './loggers';
import { DBSession } from './types';

const {
	PORT = 80,
	PLAYGROUND = false,
	DB_HOST = 'neodb',
	DB_PORT = 7687,
	DB_USER = 'neo4j',
	DB_PASS = 'neo4j',
	DB_MOCK = false,
	DEBUG = false,
} = process.env;

const db = neo4j.driver(
	'bolt://' + DB_HOST + ':' +DB_PORT,
	neo4j.auth.basic(DB_USER!, DB_PASS!)
);

const dbUtilities: IMiddleware = async (resolve, root, args, context, info) => {
	const rxSession = context.db.rxSession();
	rxSession.uuid = uuid();
	const session: DBSession = yn(DEBUG) ? debugSession(rxSession) : rxSession;
	sessionLog.info('created DB session', { uuid: rxSession.uuid });
	const result = await resolve(root, args, { ...context, rxSession, queryNode: queryNode(session) }, info);
	await rxSession.close().toPromise();
	sessionLog.info('closed DB session}', { uuid: rxSession.uuid });
	return result;
};

const server = new GraphQLServer({
	typeDefs,
	resolvers,
	context: ({ request }: ContextParameters) => {
		gatewayLog.info(`
		Request: ${request.protocol} ${request.method} ${request.path}
		from: ${request.hostname} (${request.ip})
		`);
		gatewayLog.debug(`
		with params: ${JSON.stringify(request.params)}
		with body: ${JSON.stringify(request.body)}
		`);
		return { db };
	},
	middlewares: [ dbUtilities ],
	mocks: yn(DB_MOCK) ? {
		Query: () => ({
			activities
		}),
		Appointment: () => appointments[Math.floor(Math.random()*appointments.length)],
		Activity: () => activities[Math.floor(Math.random()*activities.length)],
		// GraphQLDateTime: () => new Date().toISOString(),

	} : false
});

process.on('SIGINT', async function() {
	gatewayLog.info('Waiting for DB connection to close...');
	await db.close();
	gatewayLog.info('DB connection has closed.');
	process.exit();
});

// IDEA: ping db before starting server if mock === false. If no db: Crit log msg, dont start server.

server.start({
	port: PORT,
	playground: PLAYGROUND,
	logFunction: (msg: any) => gqlyogaLog.debug(JSON.stringify(msg))
}, () => gatewayLog.info(`
		Server is running on localhost:${PORT}
		Playground is hosted at: '${PLAYGROUND}'
		Connected to DB at ${DB_HOST + ':' + DB_PORT}
		Using mock data: ${yn(DB_MOCK)}
		Debugging active: ${yn(DEBUG)}
`));
