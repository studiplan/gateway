import { Resolvers, Activity, Appointment, User } from "../generated"
import { IResolvers } from "graphql-tools";
import { toArray } from "rxjs/operators";
import { fromInput } from "../helper";
import { Ctx } from "../types";


const resolvers: Resolvers = {
	Query: {
		activities: (_, { parentId }, { queryNode }: Ctx) => {
			return queryNode<Activity>(`
				MATCH (c)-[:BELONGS_TO]->(p)
				WHERE ID(p) = ${parentId}
				RETURN c
			`).pipe(
				toArray()
			).toPromise();
		},
		user: (_, { userId }, { queryNode }: Ctx) => {
			return queryNode<User>(`
				MATCH (u)
				WHERE ID(u) = ${userId}
				RETURN u
			`).toPromise();
		}
	},
	Mutation: {
		addActivity: (_, { input }, { queryNode }: Ctx) => {
			const { parent, ...activity } = input;
			return queryNode<Activity>(`
				MATCH (p)
				WHERE ID(p) = ${parent}
				CREATE (a${fromInput(activity)})-[:BELONGS_TO]->(p)
				RETURN a
			`).toPromise();
		},
		addAppointment: (_, { input }, { queryNode }: Ctx) => {
			const { activity, ...appointment } = input;
			return queryNode<Appointment>(`
				MATCH (p)
				WHERE ID(p) = ${activity}
				CREATE (a${fromInput(appointment)})-[:SET_BY]->(p)
				RETURN a
			`).toPromise();
		}
	},
	Activity: {
		parent: ({ id }, _, { queryNode }: Ctx) => {
			return queryNode<Activity>(`
				MATCH (a)-[:BELONGS_TO]->(p)
				WHERE ID(a) = ${id}
				RETURN p
			`).toPromise();
		},
		appointments: ({ id }, _, { queryNode }: Ctx) => {
			return queryNode<Appointment>(`
				MATCH (a)-[:SET_BY]->(p)
				WHERE ID(p) = ${id}
				RETURN a
			`).pipe(
				toArray()
			).toPromise();
		}
	},
	Appointment: {
		activity: ({ id }, _, { queryNode }: Ctx) => {
			return queryNode<Activity>(`
				MATCH (a)-[:SET_BY]->(p)
				WHERE ID(a) = ${id}
				RETURN p
			`).toPromise();
		}
	},
	User: {
		activities: ({ id }, { type }, { queryNode }: Ctx) => {
			return queryNode<Activity>(`
				MATCH (s)-[:ENROLLED_IN]->(a:${type})
				WHERE ID(s) = ${id}
				RETURN a
			`).pipe(
				toArray()
			).toPromise();
		},
		appointments: ({ id }, _, { queryNode }: Ctx) => {
			return queryNode<Appointment>(`
				MATCH (s)-[:ENROLLED_IN]->()<-[:SET_BY]-(a)
				WHERE ID(s) = ${id}
				RETURN a
			`).pipe(
				toArray()
			).toPromise();
		}
	}
};

const iResolvers: IResolvers = resolvers as IResolvers;

export default iResolvers;