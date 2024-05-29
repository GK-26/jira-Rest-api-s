import {gql, GraphQLClient, request} from 'graphql-request'
import util from 'util';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import bodyParser from 'body-parser';
import fs from 'fs';
import {teamSearch} from './queries.js'
import { getUserByID } from './queries.js';
import {jiraTeams} from './queries.js'
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
export {app}

// Replace these values with your actual Jira credentials
const clientId = process.env.PM_BY_SYNYCS_CLIENT_ID;
const clientSecret = process.env.PM_BY_SYNYCS_CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;
const scope = process.env.PM_BY_SYNYCS_REST_SCOPE;
const jiraUrl = 'https://auth.atlassian.com/authorize';


// Step 1: Direct the user to the authorization URL
app.get('/authorize', (req, res) => {
    const authorizationUrl = `${jiraUrl}?audience=api.atlassian.com&client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}&state=1234&response_type=code&prompt=consent`;
    res.redirect(authorizationUrl);
});


// Step 2: Exchange the authorization code for an access token
app.get('/pm/auth', async (req, res) => {
    const tokenUrl = 'https://auth.atlassian.com/oauth/token'; // The token URL provided by Atlassian
    let accessToken = '';
    const requestBody = {
      grant_type: 'authorization_code',
      client_id: clientId, // Replace with your actual client ID
      client_secret: clientSecret, // Replace with your actual client secret
      code: req.query.code, // Replace with the authorization code received from the callback
      redirect_uri: redirectUri, // Replace with your app's callback URL
    };
  
    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (response.ok) {
        const json = await response.json();
        let jsonToken = JSON.stringify(json);
        accessToken = json.access_token;


        fs.writeFileSync('token.json', jsonToken);
      
        res.send({accessToken})
        // You can now use this access token to make API requests on behalf of the user
      }else {
        console.error('Error exchanging authorization code for access token:', response.status);
      }
    
      const cloudId = await fetch("https://api.atlassian.com/oauth/token/accessible-resources", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
        
          if (cloudId) {
            const data = await cloudId.json(); // Parse the response data as JSON

            let jsonCloudId = JSON.stringify(data)
            fs.writeFileSync('cloudId.json', jsonCloudId)
            // Now you can work with the data object
          } else {
            console.error('Error fetching data:', response);
          }
        
        
    } catch (error) {
      console.error('An error occurred during token exchange:', error.message);
    }});


app.post('/teams', async (req, res)=>{
  try{
  
const endpoint = 'https://synycsgroup-team.atlassian.net/gateway/api/graphql';
const endpoint2 = 'https://api.atlassian.com/graphql';


const teamId = '56c0792c-75cd-46d9-b187-8a41f35d2ea6'
const tokenFile = fs.readFileSync('token.json')
    let token = JSON.parse(tokenFile);
    token = token.access_token

const headers = {
  Authorization: `Bearer ${token}`,
};

const client = new GraphQLClient(endpoint, {
  method: "POST",
  headers : {
    Authorization: `Bearer ${token}`,
    "X-ExperimentalApi" : "confluence-agg-beta"
  }
})
// Send the request to the GraphQL server
// const response = await client.request({document: getUserByID,  variables: {}});
const response = await request({
  url : endpoint,
  document : jiraTeams,
  variables : {},
  requestHeaders : headers
})
res.send(response)
}catch(err){
  res.status(500).send(err);
}
})


import { dashboard } from './controllers/dashboard.controller.js';
app.get('/dashboard', dashboard)

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


