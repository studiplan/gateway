import { GraphQLServer } from 'graphql-yoga';
import typeDefs from './typedefs/schema.gql';


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
	mocks: {
		GraphQLDateTime: () => new Date().toISOString()
	}
});

server.start(() => console.log('Server is running on localhost:4000'));