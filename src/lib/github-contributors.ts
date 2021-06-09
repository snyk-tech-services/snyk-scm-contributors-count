import { Octokit } from "@octokit/rest";
import * as yargs from 'yargs';


const args = yargs.options({
  'Personal_Access_Token': { type: 'string', demandOption: true, alias: 'pat' },
  'Github_Owner': { type: 'string', demandOption: true, alias: 'own' },
  'Github_Repo': { type: 'array', demandOption: true, alias: 'repo' },
}).argv;

const octokit = new Octokit({
  auth: args['Personal_Access_Token'],
  baseUrl: "https://api.github.com",
});

run();
  
async function run() {
  try{  
  const result = await octokit.rest.repos.listContributors({
      owner: args['Github_Owner'],
      repo: args['Github_Repo'].toString(),
    })
    console.log("There are a total of " 
    + result.data.length 
    + " contributors for the " 
    + args['Github_Repo'] + " project:" + "\n"); 

    result.data.forEach(function(item){  
      console.log(
        "Login Name:" 
        + item.login + "\n" 
        + "Number of contributions:" 
        + item.contributions + "\n" 
        + "User type:"
        + item.type + "\n")  
    });  
  }
catch(error){
console.log(error);
}
}