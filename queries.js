export const example = `query example {
    jira {
      allJiraProjects(cloudId: "15ac5d1a-09d5-40f2-910e-3c09d5568c3b", filter: {types: [SOFTWARE]}) {
        pageInfo {
          hasNextPage
        }
        edges {
          node {
            key
            name
            opsgenieTeamsAvailableToLinkWith {
              pageInfo {
                hasNextPage
              }
              edges {
                node {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  }`


export const teamSearch = ` query jiraTeams { team @optIn(to: "Team-search-v2")  { 

  teamSearchV2(organizationId:"ari:cloud:platform::org/51d30beb-1f82-4676-87cf-c8678966de26" , siteId:"15ac5d1a-09d5-40f2-910e-3c09d5568c3b") {
    nodes {
      memberCount
      includesYou
      team {displayName id 
        members {  
            nodes  {
              state
              role
              member { id name} 
                  }
          }
      }
    }

  }
}

}`


export const getUserByID = `query getUser{
  user(accountId:"60e5a86a471e61006a4c51fd"){
    id
    accountId
    accountStatus
    name
    __typename
  }
}`


export const jiraTeams = `query jiraTeams { team @optIn(to: "Team-search-v2")  { 

  teamSearchV2(organizationId:"ari:cloud:platform::org/51d30beb-1f82-4676-87cf-c8678966de26" , siteId:"15ac5d1a-09d5-40f2-910e-3c09d5568c3b") {
    nodes {
      memberCount
      includesYou
      team {displayName id 
        members {  
            nodes  {
              state
              role
              member { id name} 
                  }
          }
      }
    }

  }
}

}`