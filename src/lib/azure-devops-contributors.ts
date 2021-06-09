import * as azdev from "azure-devops-node-api";
import * as yargs from 'yargs';
import * as git from "azure-devops-node-api/GitApi";
import * as gitInterfaces from 'azure-devops-node-api/interfaces/GitInterfaces';
import { array, string } from "yargs";
const fs = require('fs')
const base64 = require('base-64');
const fetch = require('node-fetch');
const { argv } = yargs.options({
    'Org_Name': { type: 'string', demandOption: true, alias: 'org' },
    'Token': { type: 'string', demandOption: true, alias: 'pat' },
  });
const d = new Date();
const threeMonthsDate = d.getFullYear() + "/" + (d.getMonth() - 2) + "/" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
const orgUrl = "https://dev.azure.com/" + argv['Org_Name'];
const hooksUrl = "https://dev.azure.com/" + argv['Org_Name'] + "/_apis/hooks/subscriptions?consumerId=webHooks&api-version=6.0";
const token: string = argv['Token'];
const authHandler = azdev.getPersonalAccessTokenHandler(token); 
const connection = new azdev.WebApi(orgUrl, authHandler);
const criteria: gitInterfaces.GitQueryCommitsCriteria = {};
criteria.$top = 1000000;
criteria.fromDate = threeMonthsDate.toString();

interface authors {
    name: string;
    email: string;
}

interface repoData {
    projectId: string;
    repoId: string;
}

const totalUniqueContributors: string[] = [];
const projectsAndReposArray: repoData[] = [];

start();

async function start() {
    const ignoreList = await parseIgnoreFile("./Azure_Ignore_List.json");
    const getAzureHooksJson = await getHooksAndParseData(hooksUrl);
    const connect = await connectToGitAPI(orgUrl, getAzureHooksJson!);
    for(let i = 0; i < projectsAndReposArray.length; i ++){
        const getResult = await parseResult(connect!, projectsAndReposArray[i]);
        const finalRes = await printAuthors(getResult!, ignoreList!);
    }
    console.log(printTotal());
}
async function parseIgnoreFile(path: string){
    let ignoreList:string[] = [];
    try{
    let tempList = fs.readFileSync(path, 'utf8')
        ignoreList = JSON.parse(tempList).usersToIgnore;
        console.log('Ignore list parsed') ;
        return ignoreList;
}
    catch(error){
        console.log(error);
    }
}

async function getHooksAndParseData(url: string) {
    const tempArray: string[] = [];
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': "Basic " + base64.encode(":" + argv['Token']) }
        })
        const data = await res.json();
        for(let i = 0; i < data.value.length; i ++){
            let tempValue: repoData = { 
                projectId: data.value[i].publisherInputs.projectId, 
                repoId: data.value[i].publisherInputs.repository };

            if(data.value[i].consumerInputs.url.includes('snyk.io/webhook') 
            && (!tempArray.includes(data.value[i].publisherInputs.projectId + "|" 
            + data.value[i].publisherInputs.repository))){
                    tempArray.push(data.value[i].publisherInputs.projectId + "|" 
                    + data.value[i].publisherInputs.repository);
                    projectsAndReposArray.push(tempValue);
        }
    }
        return projectsAndReposArray;
    } catch (error) {
        console.log(error);
    }
}


async function connectToGitAPI(url: string, repoArray: repoData[]) {
    console.log("\n" + "Found " + repoArray.length + " Repos with Snyk Webhooks:" + "\n");
    try{
        const data:  git.GitApi = await connection.getGitApi(url);
        return data;
    }
    catch(err){
        console.log(err.message);
    }
}

async function parseResult(data: git.GitApi, item: repoData){
    try{
            const result = await data.getCommits(item.repoId, 
            criteria,
            item.projectId);
            return result;
    }
    catch(err){
        console.log(err.message);
    }
}

async function printAuthors(result: gitInterfaces.GitCommitRef[], ignoreList: string[]) {
    let repoName = "";
    let authors: authors[] = [];
    let tempNamesArray: string[] = [];

            result.forEach(function (item: any) {
                if (!tempNamesArray.includes(item.author.name) && (!ignoreList.includes(item.author.name))) {
                    tempNamesArray.push(item.author.name);
                    authors.push({ name: item.author.name, email: item.author.email });
                    totalUniqueContributors.push("Name: " + item.author.name + ", Email: " + item.author.email);
                }
                repoName = item.remoteUrl.split("/commit")[0];
            });
            console.log("There are a total of "
                + tempNamesArray.length
                + " unique authors for the "
                + repoName + " repo:" + "\n");
            authors.forEach((item) => {console.log("Name: " 
            + item.name + "\n" 
            + "Email: " + item.email + "\n")});
            return totalUniqueContributors;
}

function printTotal(){
    try{
    console.log("There are a total of " 
    + totalUniqueContributors.length 
    + " unique contributors across all repos:" + "\n")
    totalUniqueContributors.forEach((item: any) => {
        console.log(item);
    });
    console.log("\n");
    return 'Done!';
}
    catch(error){
        console.log(error);
    }
}