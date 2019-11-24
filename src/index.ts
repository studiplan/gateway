import { GraphQLServer } from 'graphql-yoga';
import typeDefs from './typedefs/schema.gql';
import resolvers from './resolvers'
import neo4j from 'neo4j-driver';
import { IMiddleware } from 'graphql-middleware';
import RxSession from 'neo4j-driver/types/session-rx';
import { queryNode, yn, debugSession } from './helper';
import { activities, appointments } from './mocks';


const db = neo4j.driver(
	'bolt://' + process.env.DB_HOST + ':' + process.env.DB_PORT,
	neo4j.auth.basic(process.env.DB_USER!, process.env.DB_PASS!)
);

const dbUtilities: IMiddleware = async (resolve, root, args, context, info) => {
	const rxSession: RxSession = yn(process.env.DEBUG) ? debugSession(context.db.rxSession()) : context.db.rxSession();
	const result = await resolve(root, args, { ...context, rxSession, queryNode: queryNode(rxSession) }, info)
	await rxSession.close().toPromise();
	return result;
};

const server = new GraphQLServer({
	typeDefs,
	resolvers,
	context: { db },
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
	console.log("Waiting for DB connection to close...");
	await db.close();
	console.log("DB connection has closed.");
	process.exit();
});

server.start({
		port: process.env.PORT,
		playground: process.env.PLAYGROUND
	}, () => console.log(`
		Server is running on localhost:${process.env.PORT}
		Playground is hosted at: '${process.env.PLAYGROUND}'
		Connected to DB at ${process.env.DB_HOST + ':' + process.env.DB_PORT}
		Using mock data: ${yn(process.env.DB_MOCK)}
		Debugging active: ${yn(process.env.DEBUG)}
`));
