/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/ban-types */
import { Project } from './org';
interface IssuesWithVulnsPaths {
  issues: {
    pkgVersionsWithPaths: {
      [key: string]: Array<Array<string>>;
    }[];
  }[];
}
export declare type AggregatedIssuesWithVulnPaths = IssuesWithVulnsPaths &
  Project.AggregatedissuesPostResponseType;
export declare const getAggregatedIssuesWithVulnPaths: (
  classContext: Object,
  body: Project.AggregatedissuesPostBodyType,
) => Promise<AggregatedIssuesWithVulnPaths>;
export {};
