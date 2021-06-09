import { Gitlab } from '@gitbeaker/node'; 
import * as yargs from 'yargs';


const { argv } = yargs.options({
  'Personal_Access_Token': { type: 'string', demandOption: true, alias: 'pat' },
  'Gitlab_Project_ID': { type: 'string', demandOption: true, alias: 'id' },
  'Gitlab_Host': { type: 'string', demandOption: true, alias: 'host' },
});

const gitlab = new Gitlab({
  token: argv['Personal_Access_Token'],
  host: argv['Gitlab_Host'],
});

run();
  
async function run() {
  try{  
  const result = await gitlab.Repositories.contributors(argv['Gitlab_Project_ID']); //gitlab.ProjectHooks.all(argv['Gitlab_Project_ID']);
    console.log("There are a total of " 
    + result.length 
    + " contributors for the " 
    + argv['Gitlab_Project_ID'] + " project:" + "\n"); 

    result.forEach(function(item){  
      console.log(
        "Name:" 
        + item.name + "\n" 
        + "Email:" 
        + item.email + "\n" 
        + "Number of commits:"
        + item.commits + "\n"
        + "Number of additions:" 
        + item.aditions + "\n" 
        + "Number of deletions:"
        + item.deletions + "\n");})
      }

catch(error){
console.log(error);
}
}