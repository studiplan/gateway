import { GraphQLServer } from 'graphql-yoga';
import typeDefs from './src/typedefs/schema.gql'

console.log(typeDefs)
const server = new GraphQLServer({ typeDefs, resolvers: {} });

server.start(() => console.log('Server is running on localhost:4000'));