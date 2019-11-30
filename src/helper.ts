import { Node, Record } from 'neo4j-driver';
import { Observable, EMPTY } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ActivityInput, AppointmentInput } from './generated';
import { sessionLog } from './loggers';
import { DBSession } from './types';


export const fromNode = <T>(node: Node): T => ({
	id: node.identity.toString(10),
	type: node.labels[0],
	...node.properties,
}) as unknown as T;

const asProperty = ([key, value]: [string, unknown]): string => {
	switch (typeof value) {
		case 'string':
			return `${key}: "${value}"`;
		default:
			return `${key}: ${value}`;
	}
};

type NodeInput = Partial<ActivityInput | AppointmentInput>;

export const fromInput = (input: NodeInput): string => {
	const { type, ...props } = input;
	return `${type ? `:${type} ` : ''}{ ${Object.entries(props).map(asProperty).join(', ')} }`;
};

/**
 * This function allows to wrap/intercept calls to rxSession for logging and debugging purposes.
 * @param session session to proxy
 */
export const debugSession = (session: DBSession): DBSession => ({
	run(...args: any[]) {
		sessionLog.info(`running query: ${args}`, { uuid: session.uuid });
		// @ts-ignore
		return session.run(...args);
	},
	beginTransaction(...args: any[]){
		sessionLog.info(`running query: ${args}`), { uuid: session.uuid };
		return session.beginTransaction(...args); },
	lastBookmark(){ return session.lastBookmark(); },
	// @ts-ignore
	readTransaction(...args: any[]){ return session.readTransaction(...args); },
	// @ts-ignore
	writeTransaction(...args: any[]){ return session.writeTransaction(...args); },
	close(){ return session.close(); },
	uuid: session.uuid
});

/**
 * This function creates a helper that extracts the first returned variable from query and constructs given type from it.
 * @param session session to create helper for
 */
export const queryNode = (session: DBSession): (query: string) => Observable<Record> => {
	return <T>(query: string) => session.run(query).records().pipe(
		map(record => record.get(record.keys[0])),
		map(node => fromNode<T>(node)),
		catchError(err => {
			sessionLog.error(`error in query: ${err}`, { uuid: session.uuid });
			return EMPTY;
		}),
	);
};

export const yn = (input: string | boolean | number | undefined): boolean => {
	input = String(input).trim();

	if (/^(?:y|yes|true|1)$/i.test(input)) {
		return true;
	} else if (/^(?:n|no|false|0)$/i.test(input)) {
		return false;
	} else {
		throw(new Error(`yn | unexpected input: ${input}`));
	}
};

export const uuid = (a: any = undefined) => a ? (a^Math.random()*16>>a/4).toString(16) : (''+1e7+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, uuid);
