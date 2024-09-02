import { gql, GraphQLClient } from 'graphql-request'

const endpoint = 'http://localhost:1212/api';
const cl = new GraphQLClient(endpoint);

export async function Client(query: any) {
  cl.setHeader("Access-Control-Allow-Origin", "*");
  cl.setHeader("Access-Control-Allow-Headers", "*");
  cl.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  return cl.request(query);
}

export { gql };
