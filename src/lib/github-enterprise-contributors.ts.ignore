import { Octokit } from "@octokit/rest";
import * as yargs from 'yargs';


const { argv } = yargs.options({
  'Personal_Access_Token': { type: 'string', demandOption: true, alias: 'pat' },
  'Github_Enterprise_Hostname': { type: 'string', demandOption: true, alias: 'host' },
  'Github_Enterprise_Org': { type: 'string', demandOption: true, alias: 'org' },
  'Github_Repo': { type: 'string', demandOption: true, alias: 'repo' },
});

const octokit = new Octokit({
  auth: argv['Personal_Access_Token'],
  baseUrl: argv['Github_Enterprise_Hostname'] + "/api/v3",
});

test();
  
async function run() {
  try{  
  const result = await octokit.rest.repos.listContributors({
      owner: argv['Github_Enterprise_Org'].toString(),
      repo: argv['Github_Repo'].toString(),
    })
    console.log("There are a total of " 
    + result.data.length 
    + " contributors for the " 
    + argv['Github_Repo'] + " project:" + "\n"); 

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

async function test() {
  try{  
  const result = await octokit.rest.repos.listWebhooks({
      owner: argv['Github_Enterprise_Org'].toString(),
      repo: argv['Github_Repo'].toString(),
    });
    console.log("There are a total of " 
    + result.data.length 
    + " contributors for the " 
    + argv['Github_Repo'] + " project:" + "\n"); 

    console.log(result.data);
    // result.data.forEach(function(item){  
    //   console.log(
    //     "Login Name:" 
    //     + item.login + "\n" 
    //     + "Number of contributions:" 
    //     + item.contributions + "\n" 
    //     + "User type:"
    //     + item.type + "\n")  
    // });  
  }
catch(error){
console.log(error);
}
}