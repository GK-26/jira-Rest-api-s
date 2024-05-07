const OAuth = require('oauth').OAuth2;
const request = require('request');
require('dotenv').config();

// Configuration
const JIRA_HOST = process.env.JIRA_HOST;
const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:3000/pm/auth';
const SCOPES = 'read:jira-user';

// Initialize OAuth client
const oauth2 = new OAuth(
    CLIENT_ID,
    CLIENT_SECRET,
    `${JIRA_HOST}/`,
    'oauth/authorize',
    'oauth/token'
);

// Redirect user to Jira for authorization
function authorizeUser(req, res) {
    const authorizationUrl = oauth2.getAuthorizeUrl({
        redirect_uri: REDIRECT_URI,
        scope: SCOPES,
        response_type: 'code'
    });
    res.redirect(authorizationUrl);
}

// Callback endpoint after user authorizes
function handleCallback(req, res) {
    const code = req.query.code;
    if (!code) {
        res.status(400).send('Authorization code missing');
        return;
    }

    // Exchange authorization code for access token
    oauth2.getOAuthAccessToken(
        code,
        { redirect_uri: REDIRECT_URI },
        (err, accessToken, refreshToken) => {
            if (err) {
                res.status(500).send('Error getting access token: ' + err.message);
                return;
            }

            // Use the access token to make requests to the Jira API
            // For example, get user information
            request.get(
                { 
                    url: `https://${JIRA_HOST}/rest/api/3/myself`,
                    auth: {
                        bearer: accessToken
                    },
                    json: true
                },
                (error, response, body) => {
                    if (error || response.statusCode !== 200) {
                        res.status(500).send('Error accessing Jira API');
                        return;
                    }
                    res.send(body);
                }
            );
        }
    );
}

// Set up routes
const express = require('express');
const app = express();

app.get('/', authorizeUser);
app.get('/pm/auth', handleCallback);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
