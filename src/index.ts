import { GraphQLServer } from 'graphql-yoga';
import typeDefs from './typedefs/schema.gql';
import resolvers from './resolvers'
import neo4j from 'neo4j-driver';


const db = neo4j.driver(
	'bolt://' + process.env.DB_HOST + ':' + process.env.DB_PORT,
	neo4j.auth.basic(process.env.DB_USER!, process.env.DB_PASS!)
);

const server = new GraphQLServer({
	typeDefs,
	resolvers,
	context: { db },
	/* mocks: {
		Query: () => ({
			activities
		}),
		Appointment: () => appointments[Math.floor(Math.random()*appointments.length)],
		Activity: () => activities[Math.floor(Math.random()*activities.length)],
		// GraphQLDateTime: () => new Date().toISOString(),

	} */
});

process.on('SIGINT', function() {
	console.log("Caught interrupt signal");
	db.close();
	process.exit();
});

server.start(() => console.log('Server is running on localhost:4000'));
