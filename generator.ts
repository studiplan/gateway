import typeDefs from './src/typedefs/schema.gql';

import { buildSchema } from 'graphql';
import * as fs from 'fs';
import * as typescriptPlugin from '@graphql-codegen/typescript';
import * as path from 'path';
import { printSchema, parse, GraphQLSchema } from 'graphql';
import { codegen } from '@graphql-codegen/core';

const schema: GraphQLSchema = buildSchema(typeDefs as unknown as string);
const outputFile = 'src/generated/graphql.ts';
const config = {
  // used by a plugin internally, although the 'typescript' plugin currently
  // returns the string output, rather than writing to a file
  filename: outputFile,
  schema: parse(printSchema(schema)),
  plugins: [ // Each plugin should be an object
    {
      typescript: {}, // Here you can pass configuration to the plugin
    },
  ],
  pluginMap: {
    typescript: typescriptPlugin,
  },
};

async function generate() {
  const output = await codegen(config);
  fs.writeFile(path.join(__dirname, outputFile), output, () => {
    console.log('Outputs generated!');
  });
};

generate();
