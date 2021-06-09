const fetch = require('node-fetch');
import * as yargs from 'yargs';

const { argv } = yargs.options({
    'Personal_Access_Token': { type: 'string', demandOption: true, alias: 'pat' },
    'Base_Url': {type: 'string', demandOption: true, alias: 'url'},
    'BBServer_Project_Key': { type: 'string', demandOption: true, alias: 'key' },
    'BBServer_Repo_Name': { type: 'array', demandOption: true, alias: 'repo' },
  });

   const url = argv['Base_Url']+ "/rest/api/1.0/projects/" 
   + argv['BBServer_Project_Key'] + "/repos/" 
   + argv['BBServer_Repo_Name'] + "/commits?limit=100000";
   
interface authorsArray {
    name: string;
    email: string;
    displayName: string;
}

let authors: authorsArray[] = [];
let tempNamesArray: string[] = [];

run(url);
  
async function run(url: string) {

    try {
        fetch(url, {
            method: 'GET',
            headers: { 'Authorization': "Bearer " + argv['Personal_Access_Token']}
        }).then((res: any) => res.json())
        .then((json: any) => parseJsonResult(json.values));
      } catch (err) {
        console.log(err);
      }
    }
function parseJsonResult(result: any) {
    result.forEach(function(item: any) {
        if(!tempNamesArray.includes(item.author.name)){
            tempNamesArray.push(item.author.name);
            authors.push({name: item.author.name, email: item.author.emailAddress , displayName:  item.author.displayName })
        }
    });
    console.log("There are a total of "
        + tempNamesArray.length
        + " authors for the "
        + argv['BBServer_Repo_Name'] + " repo:" + "\n");
    authors.forEach((item) => console.log("Name: " + item.name + "\n" 
    + "Email: " + item.email + "\n"
    + "Display Name: " + item.displayName + "\n"));
}