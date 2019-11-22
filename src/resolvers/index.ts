import { Resolvers, Activity, ActivityInput } from "../generated"
import { IResolvers } from "graphql-tools";
import RxSession from "neo4j-driver/types/session-rx";
import { map, toArray } from "rxjs/operators";
import { fromNode, fromInput } from "../helper";
import { concat } from "rxjs";


const resolvers: Resolvers = {
	Query: {
		activities: (parent, args, { db }) => {
			const rxSession: RxSession = db.rxSession();
			const result$ = rxSession.run(`
				MATCH (c)-[:BELONGS_TO]->(p)
				WHERE ID(p) = ${args.parentId}
				RETURN c
			`).records().pipe(
				map(record => record.get('c')),
				map(node => fromNode<Activity>(node)),
				toArray()
			);

			return concat(result$, rxSession.close()).toPromise();
		},
		user: () => {
			return {
				id: '',
				activities: [],
				appointments: []
		};
		}
	},
	Mutation: {
		addActivity: (parent, { input }, { db }) => {
			const rxSession: RxSession = db.rxSession();
			const result$ = rxSession.run(`
				MATCH (a)
				WHERE ID(a) = ${input.parent}
				CREATE ${fromInput<ActivityInput>(input)}-[:BELONGS_TO]->(a)
				RETURN e
			`).records().pipe(
				map(record => record.get('e')),
				map(node => fromNode<Activity>(node)),
			);

			return concat(result$, rxSession.close()).toPromise();
		}
	}
};

const iResolvers: IResolvers = resolvers as IResolvers;

export default iResolvers;