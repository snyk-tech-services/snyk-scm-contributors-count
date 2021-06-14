import { ContributorMap, Contributor } from "../../lib/types";
import { returnKeyIfEmailFoundInMap } from './utils'
import * as debugLib from "debug";

const debug = debugLib("snyk:bitbucket-server-exclude");
import * as fs from 'fs';
import * as path from 'path'


export const excludeFromListByEmail = (contributorsMap:ContributorMap, inputFilePath?:string):ContributorMap => {
    const contributorsMapToReturn = contributorsMap
    if(!inputFilePath){
        return contributorsMap
    }
    const emailExclusionList: string[] = loadListFromFile(inputFilePath)
    for(let i=0;i<emailExclusionList.length;i++){
    
        const key = returnKeyIfEmailFoundInMap(contributorsMapToReturn,emailExclusionList[i])
        if(key){
            debug(`Excluding ${emailExclusionList[i]} from map using key ${key}`)
            contributorsMapToReturn.delete(key)
        }
        
    }
    return contributorsMapToReturn
}

export const loadListFromFile = (inputFilePath: string):string[] => {
    let list:string[] = []
    try {
        const exclusionListFullFilepath = path.normalize(inputFilePath);
        list = fs.readFileSync(exclusionListFullFilepath).toString().split("\n").filter(x=>x);
        
    } catch(err) {
        debug(`Issue loading exclusion list\n`, err);
        console.log('Issue loading exclusion list')
    } finally {
        return list
    }
    
}