import typeDefs from './src/typedefs/schema.gql';
import { buildSchema } from 'graphql';
import * as fs from 'fs';
import * as typescriptPlugin from '@graphql-codegen/typescript';
import * as typescriptResolversPlugin from '@graphql-codegen/typescript-resolvers';
import * as path from 'path';
import { printSchema, parse, GraphQLSchema } from 'graphql';
import { codegen } from '@graphql-codegen/core';


const schema: GraphQLSchema = buildSchema(typeDefs as unknown as string);
const outputFile = 'src/generated/index.ts';
const options = {
  // used by a plugin internally, although the 'typescript' plugin currently
  // returns the string output, rather than writing to a file
  filename: outputFile,
  schema: parse(printSchema(schema)),
  plugins: [ // Each plugin should be an object
    {
      typescript: {} // Here you can pass configuration to the plugin
    },
  ],
  pluginMap: {
    typescript: typescriptPlugin
  },
  documents: [],
  config: {}
};

const resolverPlugin = {
  plugins: [ // Each plugin should be an object
    {
      typescriptResolvers: {}
    },
  ],
  pluginMap: {
    typescriptResolvers: typescriptResolversPlugin
  }
}

async function generate() {
  const types = await codegen(options);
  fs.writeFile(path.join(__dirname, outputFile), types, async () => {
    console.log('Types generated!');
    const resolverTypes = await codegen({...options, ...resolverPlugin });
    fs.appendFile(path.join(__dirname, outputFile), resolverTypes, () => {
      console.log('Resolver types generated!');
    });
  });

};

generate();
