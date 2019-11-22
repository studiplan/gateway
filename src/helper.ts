import { Node } from 'neo4j-driver';
import { ActivityInput, AppointmentInput } from './generated';

export const fromNode = <T>(node: Node): T => ({
	id: node.identity.toString(10),
	type: node.labels[0],
	...node.properties,
}) as unknown as T;

const asProperty = ([key, value]: [string, unknown]) => {
	switch (typeof value) {
		case 'string':
			return `${key}: "${value}"`;
		default:
			return `${key}: ${value}`;
	}
}

export const fromInput = <T extends ActivityInput | AppointmentInput>(input: T): string => {
	const { type, ...props } = input;
	console.log(`(e:${type} { ${Object.entries(props).map(asProperty).join(', ')} })`)
	return `(e:${type} { ${Object.entries(props).map(asProperty).join(', ')} })`
}
