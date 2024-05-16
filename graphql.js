const { request, gql } = require('graphql-request');

const endpoint = 'YOUR_GRAPHQL_ENDPOINT';

const query = gql`
  query {
    teams {
      id
      name
      members
    }
  }
`;

// Send the request to the GraphQL server
request(endpoint, query)
  .then(data => console.log(data))
  .catch(error => console.error(error));
