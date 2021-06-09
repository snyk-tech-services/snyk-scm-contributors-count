import * as yargs from 'yargs';
import { Bitbucket } from 'bitbucket';

const { argv } = yargs.options({
    'Username': { type: 'string', demandOption: true, alias: 'user' },
    'Password': {type: 'string', demandOption: true, alias: 'pass'},
    'Workspace': { type: 'string', demandOption: true, alias: 'ws' },
    'Repo': { type: 'string', demandOption: true, alias: 'repo' },
  });

const clientOptions = {
    auth: {
      username: argv['Username'],
      password: argv['Password'],
    }
  }
const bitbucket = new Bitbucket(clientOptions);

interface authorsArray {
    name: string;
    type: string;
}
let authors: authorsArray[] = [];
let tempNamesArray: string[] = [];

start();
async function start() {
  const { data, headers, status, url } = await bitbucket.repositories.listWebhooks({
    workspace: argv['Workspace'].toString(),
    repo_slug: argv['Repo'].toString(),
  })
}
  
async function run() {
  try {
    const { data, headers, status, url } = await bitbucket.commits.list({
        workspace: argv['Workspace'].toString(),
        repo_slug: argv['Repo'].toString(),
      })
      parseJsonResult(data.values);
  } catch (err) {
    const { message, error, headers, request, status } = err;
    console.log(message);
  }
}

function parseJsonResult(data: any) {
    data.forEach(function (item: any) {
        if (!tempNamesArray.includes(item.author.raw)) {
            tempNamesArray.push(item.author.raw);
            authors.push({ name: item.author.raw, type: item.author.type });
        }
    });
    console.log("There are a total of "
        + tempNamesArray.length
        + " authors for the "
        + argv['repo'] + " repo:" + "\n");
    authors.forEach((item) => console.log("Name(raw): " + item.name + "\n" 
    + "Type: " + item.type + "\n"));
}