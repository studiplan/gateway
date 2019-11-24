import { Node, Record } from 'neo4j-driver';
import { ActivityInput, AppointmentInput } from './generated';
import RxSession from 'neo4j-driver/types/session-rx';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

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

export const debugSession = (session: RxSession): RxSession => ({
	run(...args: any[]) {
		console.log(`running query: ${args}`);
		// @ts-ignore
		return session.run(...args);
	},
	beginTransaction(...args: any[]){ return session.beginTransaction(...args); },
	lastBookmark(){ return session.lastBookmark(); },
	// @ts-ignore
	readTransaction(...args: any[]){ return session.readTransaction(...args); },
	// @ts-ignore
	writeTransaction(...args: any[]){ return session.writeTransaction(...args); },
	close(){ return session.close(); }
});

export const queryNode = (session: RxSession): (query: string) => Observable<Record> => {
	return <T>(query: string) => session.run(query).records().pipe(
		map(record => record.get(record.keys[0])),
		map(node => fromNode<T>(node)),
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
}