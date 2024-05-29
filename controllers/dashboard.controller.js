import axios from "axios";
import fs from 'fs';

export const dashboard = async (req, res) => {
    try{
const tokenFile = fs.readFileSync('./token.json')
    let token = JSON.parse(tokenFile);
    token = token.access_token

let projects = await fetch('https://api.atlassian.com/ex/jira/15ac5d1a-09d5-40f2-910e-3c09d5568c3b/rest/api/3/project', {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
projects = await projects.json();
let projectsLength = projects.length;

let users = await fetch('https://api.atlassian.com/ex/jira/15ac5d1a-09d5-40f2-910e-3c09d5568c3b/rest/api/2/users', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
users = await users.json();

let allProjectIssues = {};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

let getProjectIssues = async (projects)=>{
  try {
    for(let project of projects){
      let response = await fetch(`https://api.atlassian.com/ex/jira/15ac5d1a-09d5-40f2-910e-3c09d5568c3b/rest/api/3/search?jql=project=${project.id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    let data = await response.json();

    // Process the data and extract relevant information
    let issues = data.issues
        .filter(el => el.fields.issuetype.name === 'Task')
        .map(el => ({
            taskId: el.id,
            taskKey: el.key,
            taskSummary: el.fields.summary,
        
            taskStatus: el.fields.status.name,
        }));
        allProjectIssues[project.name] = issues
        await delay(1000)
    }
   return
} catch (error) {
    console.error(`Error fetching data for project `, error);
}
}

await getProjectIssues(projects)

console.log(`projectIssues: ${JSON.stringify(allProjectIssues, null, 2)}`)

// taskStatus TO DO | DONE | IN PROGRESS
// let projectPerformance = await fetch('')
return res.status(200).send({
  "projects": projectsLength,
  "users": users.length,
  "allProjectIssues": allProjectIssues
})
}catch(err){
    return res.status(500).send(`error: ${err.message}`)
}
}

