import { GraphQLServer } from 'graphql-yoga';
import typeDefs from './typedefs/schema.gql';
import { appointments, activities } from './mocks'
import { ContextParameters } from 'graphql-yoga/dist/types';


const resolvers = {
	Schedule: {
		__resolveType(obj: any, context: any, info: any) {
			if(obj.interval){
			  return 'Reoccurring';
			} else {
				return 'Onetime';
			}
		  }
	}
};



const server = new GraphQLServer({
	typeDefs,
	resolvers,
	context: (req: ContextParameters) => {
		console.log('got request:', req.request.hostname);
		return req;
	},
	mocks: {
		Query: () => ({
			activities
		}),
		Appointment: () => appointments[Math.floor(Math.random()*appointments.length)],
		Activity: () => activities[Math.floor(Math.random()*activities.length)],
		// GraphQLDateTime: () => new Date().toISOString(),

	}
});

server.start(() => console.log('Server is running on localhost:4000'));