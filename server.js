const request = require('request');
const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Replace these values with your actual Jira credentials
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;
const scope = process.env.SCOPE;
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
        // console.log('Access token:', accessToken);

        
        fs.writeFileSync('token.json', jsonToken);
      
        res.send({accessToken})
        // You can now use this access token to make API requests on behalf of the user
      }else {
        console.error('Error exchanging authorization code for access token:', response.status);
      }
    
      const clientId = await fetch("https://api.atlassian.com/oauth/token/accessible-resources", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
        
          if (clientId) {
            const data = await clientId.json(); // Parse the response data as JSON
            console.log('Data received:', data);
            let jsonClientId = JSON.stringify(data)
            fs.writeFileSync('clientId.json', jsonClientId)
            // Now you can work with the data object
          } else {
            console.error('Error fetching data:', response);
          }
        
        
    } catch (error) {
      console.error('An error occurred during token exchange:', error.message);
    }});






// Step 3: Authorize calls to the product APIs using the access token
function makeAPICall(endpoint, callback) {
    const options = {
        url: `${jiraUrl}${endpoint}`,
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };

    request(options, callback);
}

// Example API call
app.get('/api/call', (req, res) => {
    makeAPICall('/rest/api/3/issue/ISSUE-KEY', (error, response, body) => {
        if (!error && response.statusCode === 200) {
            res.send(body);
        } else {
            res.send('Error making API call.');
        }
    });
});

// Step 4: Check site access for the app
app.get('/check-access', (req, res) => {
    makeAPICall('/rest/api/3/myself', (error, response, body) => {
        if (!error && response.statusCode === 200) {
            res.send('App has access to the Jira site.');
        } else {
            res.send('App does not have access to the Jira site.');
        }
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
