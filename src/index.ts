import { GraphQLServer } from 'graphql-yoga';
import neo4j from 'neo4j-driver';
import { IMiddleware } from 'graphql-middleware';
import { ContextParameters } from 'graphql-yoga/dist/types';

import { queryNode, yn, debugSession, uuid } from './helper';
import { activities, appointments } from './mocks';
import typeDefs from './typedefs/schema.gql';
import resolvers from './resolvers'
import { gatewayLog, sessionLog, gqlyogaLog } from './loggers';
import { DBSession } from './types';


const db = neo4j.driver(
	'bolt://' + process.env.DB_HOST + ':' + process.env.DB_PORT,
	neo4j.auth.basic(process.env.DB_USER!, process.env.DB_PASS!)
);

const dbUtilities: IMiddleware = async (resolve, root, args, context, info) => {
	const rxSession = context.db.rxSession();
	rxSession.uuid = uuid();
	const session: DBSession = yn(process.env.DEBUG) ? debugSession(rxSession) : rxSession;
	sessionLog.info(`created DB session`, { uuid: rxSession.uuid });
	const result = await resolve(root, args, { ...context, rxSession, queryNode: queryNode(session) }, info);
	await rxSession.close().toPromise();
	sessionLog.info(`closed DB session}`, { uuid: rxSession.uuid });
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
	mocks: yn(process.env.DB_MOCK) ? {
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
		port: process.env.PORT,
		playground: process.env.PLAYGROUND,
		logFunction: (msg: any) => gqlyogaLog.debug(JSON.stringify(msg))
	}, () => gatewayLog.info(`
		Server is running on localhost:${process.env.PORT}
		Playground is hosted at: '${process.env.PLAYGROUND}'
		Connected to DB at ${process.env.DB_HOST + ':' + process.env.DB_PORT}
		Using mock data: ${yn(process.env.DB_MOCK)}
		Debugging active: ${yn(process.env.DEBUG)}
`));
