/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-irregular-whitespace */
import { AggregatedIssuesWithVulnPaths } from './aggregatedissues';
interface orgClass {
  orgId: string;
}
export interface OrgPostBodyType {
  /**
   * The name of the new organization
   */
  name: string;
  /**
   * The group ID. The `API_KEY` must have access to this group.
   */
  groupId?: string;
  /**
   * The id of an organization to copy settings from.
   *
   * If provided, this organization must be associated with the same group.
   *
   * The items that will be copied are:
   * Source control integrations (GitHub, GitLab, BitBucket)
   * \+ Container registries integrations (ACR, Docker Hub, ECR, GCR)
   * \+ Container orchestrators integrations (Kubernetes)
   * \+ PaaS and Serverless Integrations (Heroku, AWS Lambda)
   * \+ Notification integrations (Slack, Jira)
   * \+ Policies
   * \+ Ignore settings
   * \+ Language settings
   * \+ Infrastructure as Code settings
   * \+ Snyk Code settings
   *
   * The following will not be copied across:
   * Service accounts
   * \+ Members
   * \+ Projects
   * \+ Notification preferences
   */
  sourceOrgId?: string;
}
export interface OrgPostResponseType {
  header: undefined;
}
export interface OrgDeleteResponseType {
  header: undefined;
}
export declare class Org {
  private currentContext;
  private fullResponse;
  private orgId;
  notificationsettings: Notificationsettings.Notificationsettings;
  invite: Invite.Invite;
  settings: Settings.Settings;
  provision: Provision.Provision;
  projects: Projects.Projects;
  dependencies: Dependencies.Dependencies;
  licenses: Licenses.Licenses;
  entitlements: Entitlements.Entitlements;
  audit: Audit.Audit;
  constructor(Orgparam?: orgClass, fullResponse?: boolean);
  members(Membersparam?: membersClass): Members.Members;
  integrations(
    Integrationsparam?: integrationsClass,
  ): Integrations.Integrations;
  project(Projectparam?: projectClass): Project.Project;
  entitlement(Entitlementparam?: entitlementClass): Entitlement.Entitlement;
  webhooks(Webhooksparam?: webhooksClass): Webhooks.Webhooks;
  post(body: OrgPostBodyType): Promise<OrgPostResponseType>;
  delete(): Promise<OrgDeleteResponseType>;
}
export interface NotificationsettingsPutBodyType {
  'new-issues-remediations'?: {
    /**
     * Whether notifications should be sent
     */
    enabled: boolean;
    /**
     * The severity levels of issues to send notifications for (only applicable for `new-remediations-vulnerabilities` notificationType)
     */
    issueSeverity: 'all' | 'high';
    /**
     * Filter the types of issue to include in notifications (only applicable for `new-remediations-vulnerabilities` notificationType)
     */
    issueType: 'all' | 'vuln' | 'license' | 'none';
  };
  'project-imported'?: {
    /**
     * Whether notifications should be sent
     */
    enabled: boolean;
  };
  'test-limit'?: {
    /**
     * Whether notifications should be sent
     */
    enabled: boolean;
  };
  'weekly-report'?: {
    /**
     * Whether notifications should be sent
     */
    enabled: boolean;
  };
}
export interface NotificationsettingsGetResponseType {
  'new-issues-remediations'?: {
    /**
     * Whether notifications should be sent
     */
    enabled: boolean;
    /**
     * The severity levels of issues to send notifications for (only applicable for `new-remediations-vulnerabilities` notificationType)
     */
    issueSeverity: 'all' | 'high';
    /**
     * Filter the types of issue to include in notifications (only applicable for `new-remediations-vulnerabilities` notificationType)
     */
    issueType: 'all' | 'vuln' | 'license' | 'none';
    /**
     * Whether the setting was found on the requested context directly or inherited from a parent
     */
    inherited?: boolean;
  };
  'project-imported'?: {
    /**
     * Whether notifications should be sent
     */
    enabled: boolean;
    /**
     * Whether the setting was found on the requested context directly or inherited from a parent
     */
    inherited?: boolean;
  };
  'test-limit'?: {
    /**
     * Whether notifications should be sent
     */
    enabled: boolean;
    /**
     * Whether the setting was found on the requested context directly or inherited from a parent
     */
    inherited?: boolean;
  };
  'weekly-report'?: {
    /**
     * Whether notifications should be sent
     */
    enabled: boolean;
    /**
     * Whether the setting was found on the requested context directly or inherited from a parent
     */
    inherited?: boolean;
  };
}
export interface NotificationsettingsPutResponseType {
  'new-issues-remediations'?: {
    /**
     * Whether notifications should be sent
     */
    enabled: boolean;
    /**
     * The severity levels of issues to send notifications for (only applicable for `new-remediations-vulnerabilities` notificationType)
     */
    issueSeverity: 'all' | 'high';
    /**
     * Filter the types of issue to include in notifications (only applicable for `new-remediations-vulnerabilities` notificationType)
     */
    issueType: 'all' | 'vuln' | 'license' | 'none';
    /**
     * Whether the setting was found on the requested context directly or inherited from a parent
     */
    inherited?: boolean;
  };
  'project-imported'?: {
    /**
     * Whether notifications should be sent
     */
    enabled: boolean;
    /**
     * Whether the setting was found on the requested context directly or inherited from a parent
     */
    inherited?: boolean;
  };
  'test-limit'?: {
    /**
     * Whether notifications should be sent
     */
    enabled: boolean;
    /**
     * Whether the setting was found on the requested context directly or inherited from a parent
     */
    inherited?: boolean;
  };
  'weekly-report'?: {
    /**
     * Whether notifications should be sent
     */
    enabled: boolean;
    /**
     * Whether the setting was found on the requested context directly or inherited from a parent
     */
    inherited?: boolean;
  };
}
export declare namespace Notificationsettings {
  class Notificationsettings {
    private currentContext;
    constructor(parentContext: Object, fullResponse?: boolean);
    get(): Promise<NotificationsettingsGetResponseType>;
    put(
      body: NotificationsettingsPutBodyType,
    ): Promise<NotificationsettingsPutResponseType>;
  }
}
export interface InvitePostBodyType {
  /**
   * The email of the user.
   */
  email?: string;
  /**
   * (optional) Set the role as admin.
   */
  isAdmin?: boolean;
}
export declare type InvitePostResponseType = any;
export declare namespace Invite {
  class Invite {
    private currentContext;
    constructor(parentContext: Object, fullResponse?: boolean);
    post(body: InvitePostBodyType): Promise<any>;
  }
}
interface membersClass {
  userId: string;
}
export interface MembersPutBodyType {
  /**
   * The new role of the user, "admin" or "collaborator".
   */
  role?: string;
}
export interface MembersGetResponseType {
  [key: string]: any;
}
export declare type MembersPutResponseType = any;
export declare type MembersDeleteResponseType = any;
export declare namespace Members {
  export class Members {
    private currentContext;
    private userId?;
    constructor(
      parentContext: Object,
      Membersparam: membersClass,
      fullResponse?: boolean,
    );
    update(Updateparam?: updateClass): Update.Update;
    get(includeGroupAdmins?: boolean): Promise<MembersGetResponseType>;
    put(body: MembersPutBodyType): Promise<any>;
    delete(): Promise<any>;
  }
  interface updateClass {
    userId: string;
  }
  export interface UpdatePutBodyType {
    /**
     * The new role public ID to update the user to.
     */
    rolePublicId?: string;
  }
  export type UpdatePutResponseType = any;
  export namespace Update {
    class Update {
      private currentContext;
      private userId;
      constructor(
        parentContext: Object,
        Updateparam: updateClass,
        fullResponse?: boolean,
      );
      put(body: UpdatePutBodyType): Promise<any>;
    }
  }
  export {};
}
export interface SettingsPutBodyType {
  /**
   * Can only be updated if `API_KEY` has edit access to request access settings.
   */
  requestAccess?: {
    /**
     * Whether requesting access to the organization is enabled.
     */
    enabled: boolean;
  };
}
export interface SettingsGetResponseType {
  /**
   * Will only be returned if `API_KEY` has read access to request access settings.
   */
  requestAccess?: {
    /**
     * Whether requesting access to the organization is enabled.
     */
    enabled: boolean;
  };
}
export interface SettingsPutResponseType {
  /**
   * Will only be returned if `API_KEY` has read access to request access settings.
   */
  requestAccess?: {
    /**
     * Whether requesting access to the organization is enabled.
     */
    enabled: boolean;
  };
}
export declare namespace Settings {
  class Settings {
    private currentContext;
    constructor(parentContext: Object, fullResponse?: boolean);
    get(): Promise<SettingsGetResponseType>;
    put(body: SettingsPutBodyType): Promise<SettingsPutResponseType>;
  }
}
export interface ProvisionPostBodyType {
  /**
   * The email of the user.
   */
  email: string;
  /**
   * ID of the role to grant this user.
   */
  rolePublicId?: string;
  /**
   * Deprecated. Name of the role to grant this user. Must be one of `ADMIN`, `COLLABORATOR`, or `RESTRICTED_COLLABORATOR`. This field is invalid if `rolePublicId` is supplied with the request.
   */
  role?: string;
}
export interface ProvisionPostResponseType {
  /**
   * The email of the user.
   */
  email?: string;
  /**
   * Name of the role granted for this user.
   */
  role?: string;
  /**
   * ID of the role to granted for this user.
   */
  rolePublicId?: string;
  /**
   * Timestamp of when this provision record was created.
   */
  created?: string;
}
export interface ProvisionGetResponseType {
  [key: string]: any;
}
export interface ProvisionDeleteResponseType {
  /**
   * Deletion succeeded.
   */
  ok?: boolean;
}
export declare namespace Provision {
  class Provision {
    private currentContext;
    constructor(parentContext: Object, fullResponse?: boolean);
    post(body: ProvisionPostBodyType): Promise<ProvisionPostResponseType>;
    get(): Promise<ProvisionGetResponseType>;
    delete(): Promise<ProvisionDeleteResponseType>;
  }
}
interface integrationsClass {
  integrationId?: string;
  type?: string;
}
export declare type IntegrationsPostBodyType = IntegrationsPostBodyType1 &
  IntegrationsPostBodyType2;
interface IntegrationsPostBodyType1 {
  /**
   * integration type
   */
  type:
    | 'acr'
    | 'artifactory-cr'
    | 'azure-repos'
    | 'bitbucket-cloud'
    | 'bitbucket-server'
    | 'digitalocean-cr'
    | 'docker-hub'
    | 'ecr'
    | 'gcr'
    | 'github'
    | 'github-cr'
    | 'github-enterprise'
    | 'gitlab'
    | 'gitlab-cr'
    | 'google-artifact-cr'
    | 'harbor-cr'
    | 'nexus-cr'
    | 'quay-cr';
  /**
   * credentials for given integration
   */
  credentials:
    | {
        AcrCredentials?: {
          username: string;
          password: string;
          /**
           * e.g.: `name.azurecr.io`
           */
          registryBase: string;
        };
      }
    | {
        ArtifactoryCrCredentials?: {
          username: string;
          password: string;
          /**
           * e.g.: `name.jfrog.io`
           */
          registryBase: string;
        };
      }
    | {
        AzureReposCredentials?: {
          username: string;
          url: string;
        };
      }
    | {
        BitbucketCloudCredentials?: {
          username: string;
          password: string;
        };
      }
    | {
        BitbucketServerCredentials?: {
          username: string;
          password: string;
          url: string;
        };
      }
    | {
        DigitalOceanCrCredentials?: {
          /**
           * Personal Access Token
           */
          token: string;
        };
      }
    | {
        DockerHubCredentials?: {
          username: string;
          /**
           * Access Token
           */
          password: string;
        };
      }
    | {
        EcrCredentials?: {
          /**
           * e.g.: `eu-west-3`
           */
          region: string;
          /**
           * e.g.: `arn:aws:iam::<account-id>:role/<newRole>`
           */
          roleArn: string;
        };
      }
    | {
        GcrCredentials?: {
          /**
           * JSON key file
           */
          password: string;
          /**
           * e.g.: `gcr.io`, `us.gcr.io`, `eu.gcr.io`, `asia.gcr.io`
           */
          registryBase: string;
        };
      }
    | {
        GitHubCredentials?: {
          token: string;
        };
      }
    | {
        GitHubCrCredentials?: {
          username: string;
          password: string;
          /**
           * e.g.: `ghcr.io`
           */
          registryBase: string;
        };
      }
    | {
        GitHubEnterpriseCredentials?: {
          token: string;
          url: string;
        };
      }
    | {
        GitLabCredentials?: {
          token: string;
          /**
           * for self-hosted GitLab only
           */
          url?: string;
        };
      }
    | {
        GitLabCrCredentials?: {
          username: string;
          password: string;
          /**
           * e.g.: `your.gitlab.host`
           */
          registryBase: string;
        };
      }
    | {
        GoogleArtifactCrCredentials?: {
          /**
           * JSON key file
           */
          password: string;
          /**
           * e.g.: `us-east1-docker.pkg.dev`, `europe-west1-docker.pkg.dev`
           */
          registryBase: string;
        };
      }
    | {
        HarborCrCredentials?: {
          username: string;
          password: string;
          /**
           * e.g.: `your.harbor.host`
           */
          registryBase: string;
        };
      }
    | {
        NexusCrCredentials?: {
          username: string;
          password: string;
          /**
           * e.g.: `your.nexus.host`
           */
          registryBase: string;
        };
      }
    | {
        QuayCrCredentials?: {
          username: string;
          password: string;
          /**
           * e.g.: `quay.io`, `your.quay.host`
           */
          registryBase: string;
        };
      };
}
interface IntegrationsPostBodyType2 {
  /**
   * integration type
   */
  type:
    | 'acr'
    | 'artifactory-cr'
    | 'azure-repos'
    | 'bitbucket-cloud'
    | 'bitbucket-server'
    | 'digitalocean-cr'
    | 'docker-hub'
    | 'ecr'
    | 'gcr'
    | 'github'
    | 'github-cr'
    | 'github-enterprise'
    | 'gitlab'
    | 'gitlab-cr'
    | 'google-artifact-cr'
    | 'harbor-cr'
    | 'nexus-cr'
    | 'quay-cr';
  /**
   * brokered integration settings
   */
  broker: {
    enabled?: boolean;
  };
}
export declare type IntegrationsPutBodyType = IntegrationsPutBodyType1 &
  IntegrationsPutBodyType2 &
  IntegrationsPutBodyType3;
interface IntegrationsPutBodyType1 {
  /**
   * integration type
   */
  type:
    | 'acr'
    | 'artifactory-cr'
    | 'azure-repos'
    | 'bitbucket-cloud'
    | 'bitbucket-server'
    | 'digitalocean-cr'
    | 'docker-hub'
    | 'ecr'
    | 'gcr'
    | 'github'
    | 'github-cr'
    | 'github-enterprise'
    | 'gitlab'
    | 'gitlab-cr'
    | 'google-artifact-cr'
    | 'harbor-cr'
    | 'nexus-cr'
    | 'quay-cr';
  /**
   * brokered integration settings
   */
  broker: {
    enabled?: boolean;
  };
}
interface IntegrationsPutBodyType2 {
  /**
   * integration type
   */
  type:
    | 'acr'
    | 'artifactory-cr'
    | 'azure-repos'
    | 'bitbucket-cloud'
    | 'bitbucket-server'
    | 'digitalocean-cr'
    | 'docker-hub'
    | 'ecr'
    | 'gcr'
    | 'github'
    | 'github-cr'
    | 'github-enterprise'
    | 'gitlab'
    | 'gitlab-cr'
    | 'google-artifact-cr'
    | 'harbor-cr'
    | 'nexus-cr'
    | 'quay-cr';
  /**
   * credentials for given integration
   */
  credentials:
    | {
        AcrCredentials?: {
          username: string;
          password: string;
          /**
           * e.g.: `name.azurecr.io`
           */
          registryBase: string;
        };
      }
    | {
        ArtifactoryCrCredentials?: {
          username: string;
          password: string;
          /**
           * e.g.: `name.jfrog.io`
           */
          registryBase: string;
        };
      }
    | {
        AzureReposCredentials?: {
          username: string;
          url: string;
        };
      }
    | {
        BitbucketCloudCredentials?: {
          username: string;
          password: string;
        };
      }
    | {
        BitbucketServerCredentials?: {
          username: string;
          password: string;
          url: string;
        };
      }
    | {
        DigitalOceanCrCredentials?: {
          /**
           * Personal Access Token
           */
          token: string;
        };
      }
    | {
        DockerHubCredentials?: {
          username: string;
          /**
           * Access Token
           */
          password: string;
        };
      }
    | {
        EcrCredentials?: {
          /**
           * e.g.: `eu-west-3`
           */
          region: string;
          /**
           * e.g.: `arn:aws:iam::<account-id>:role/<newRole>`
           */
          roleArn: string;
        };
      }
    | {
        GcrCredentials?: {
          /**
           * JSON key file
           */
          password: string;
          /**
           * e.g.: `gcr.io`, `us.gcr.io`, `eu.gcr.io`, `asia.gcr.io`
           */
          registryBase: string;
        };
      }
    | {
        GitHubCredentials?: {
          token: string;
        };
      }
    | {
        GitHubCrCredentials?: {
          username: string;
          password: string;
          /**
           * e.g.: `ghcr.io`
           */
          registryBase: string;
        };
      }
    | {
        GitHubEnterpriseCredentials?: {
          token: string;
          url: string;
        };
      }
    | {
        GitLabCredentials?: {
          token: string;
          /**
           * for self-hosted GitLab only
           */
          url?: string;
        };
      }
    | {
        GitLabCrCredentials?: {
          username: string;
          password: string;
          /**
           * e.g.: `your.gitlab.host`
           */
          registryBase: string;
        };
      }
    | {
        GoogleArtifactCrCredentials?: {
          /**
           * JSON key file
           */
          password: string;
          /**
           * e.g.: `us-east1-docker.pkg.dev`, `europe-west1-docker.pkg.dev`
           */
          registryBase: string;
        };
      }
    | {
        HarborCrCredentials?: {
          username: string;
          password: string;
          /**
           * e.g.: `your.harbor.host`
           */
          registryBase: string;
        };
      }
    | {
        NexusCrCredentials?: {
          username: string;
          password: string;
          /**
           * e.g.: `your.nexus.host`
           */
          registryBase: string;
        };
      }
    | {
        QuayCrCredentials?: {
          username: string;
          password: string;
          /**
           * e.g.: `quay.io`, `your.quay.host`
           */
          registryBase: string;
        };
      };
}
interface IntegrationsPutBodyType3 {
  /**
   * integration type
   */
  type:
    | 'acr'
    | 'artifactory-cr'
    | 'azure-repos'
    | 'bitbucket-cloud'
    | 'bitbucket-server'
    | 'digitalocean-cr'
    | 'docker-hub'
    | 'ecr'
    | 'gcr'
    | 'github'
    | 'github-cr'
    | 'github-enterprise'
    | 'gitlab'
    | 'gitlab-cr'
    | 'google-artifact-cr'
    | 'harbor-cr'
    | 'nexus-cr'
    | 'quay-cr';
  /**
   * brokered integration settings
   */
  broker: {
    enabled?: boolean;
  };
  /**
   * credentials for given integration
   */
  credentials:
    | {
        AcrCredentials?: {
          username: string;
          password: string;
          /**
           * e.g.: `name.azurecr.io`
           */
          registryBase: string;
        };
      }
    | {
        ArtifactoryCrCredentials?: {
          username: string;
          password: string;
          /**
           * e.g.: `name.jfrog.io`
           */
          registryBase: string;
        };
      }
    | {
        AzureReposCredentials?: {
          username: string;
          url: string;
        };
      }
    | {
        BitbucketCloudCredentials?: {
          username: string;
          password: string;
        };
      }
    | {
        BitbucketServerCredentials?: {
          username: string;
          password: string;
          url: string;
        };
      }
    | {
        DigitalOceanCrCredentials?: {
          /**
           * Personal Access Token
           */
          token: string;
        };
      }
    | {
        DockerHubCredentials?: {
          username: string;
          /**
           * Access Token
           */
          password: string;
        };
      }
    | {
        EcrCredentials?: {
          /**
           * e.g.: `eu-west-3`
           */
          region: string;
          /**
           * e.g.: `arn:aws:iam::<account-id>:role/<newRole>`
           */
          roleArn: string;
        };
      }
    | {
        GcrCredentials?: {
          /**
           * JSON key file
           */
          password: string;
          /**
           * e.g.: `gcr.io`, `us.gcr.io`, `eu.gcr.io`, `asia.gcr.io`
           */
          registryBase: string;
        };
      }
    | {
        GitHubCredentials?: {
          token: string;
        };
      }
    | {
        GitHubCrCredentials?: {
          username: string;
          password: string;
          /**
           * e.g.: `ghcr.io`
           */
          registryBase: string;
        };
      }
    | {
        GitHubEnterpriseCredentials?: {
          token: string;
          url: string;
        };
      }
    | {
        GitLabCredentials?: {
          token: string;
          /**
           * for self-hosted GitLab only
           */
          url?: string;
        };
      }
    | {
        GitLabCrCredentials?: {
          username: string;
          password: string;
          /**
           * e.g.: `your.gitlab.host`
           */
          registryBase: string;
        };
      }
    | {
        GoogleArtifactCrCredentials?: {
          /**
           * JSON key file
           */
          password: string;
          /**
           * e.g.: `us-east1-docker.pkg.dev`, `europe-west1-docker.pkg.dev`
           */
          registryBase: string;
        };
      }
    | {
        HarborCrCredentials?: {
          username: string;
          password: string;
          /**
           * e.g.: `your.harbor.host`
           */
          registryBase: string;
        };
      }
    | {
        NexusCrCredentials?: {
          username: string;
          password: string;
          /**
           * e.g.: `your.nexus.host`
           */
          registryBase: string;
        };
      }
    | {
        QuayCrCredentials?: {
          username: string;
          password: string;
          /**
           * e.g.: `quay.io`, `your.quay.host`
           */
          registryBase: string;
        };
      };
}
export interface IntegrationsGetResponseType {
  [key: string]: any;
}
export interface IntegrationsPostResponseType {
  id?: string;
  brokerToken?: string;
}
export interface IntegrationsPutResponseType {
  id?: string;
}
export declare namespace Integrations {
  export class Integrations {
    private currentContext;
    private integrationId?;
    private type?;
    authentication: Authentication.Authentication;
    clone: Clone.Clone;
    settings: Settings.Settings;
    constructor(
      parentContext: Object,
      Integrationsparam: integrationsClass,
      fullResponse?: boolean,
    );
    import(Importparam?: importClass): Import.Import;
    get(): Promise<IntegrationsGetResponseType>;
    post(body: IntegrationsPostBodyType): Promise<IntegrationsPostResponseType>;
    put(body: IntegrationsPutBodyType): Promise<IntegrationsPutResponseType>;
  }
  export type AuthenticationDeleteResponseType = any;
  export namespace Authentication {
    class Authentication {
      private currentContext;
      provisiontoken: Provisiontoken.Provisiontoken;
      switchtoken: Switchtoken.Switchtoken;
      constructor(parentContext: Object, fullResponse?: boolean);
      delete(): Promise<any>;
    }
    interface ProvisiontokenPostResponseType {
      id?: string;
      provisionalBrokerToken?: string;
    }
    namespace Provisiontoken {
      class Provisiontoken {
        private currentContext;
        constructor(parentContext: Object, fullResponse?: boolean);
        post(): Promise<ProvisiontokenPostResponseType>;
      }
    }
    type SwitchtokenPostResponseType = any;
    namespace Switchtoken {
      class Switchtoken {
        private currentContext;
        constructor(parentContext: Object, fullResponse?: boolean);
        post(): Promise<any>;
      }
    }
  }
  export interface ClonePostBodyType {
    /**
     * The organization public ID. The `API_KEY` must have access to this organization.
     *
     * {
     *     "destinationOrgPublicId": "9a3e5d90-b782-468a-a042-9a2073736f0b1"
     * }
     */
    destinationOrgPublicId: string;
  }
  export interface ClonePostResponseType {
    newIntegrationId?: string;
  }
  export namespace Clone {
    class Clone {
      private currentContext;
      constructor(parentContext: Object, fullResponse?: boolean);
      post(body: ClonePostBodyType): Promise<ClonePostResponseType>;
    }
  }
  export interface SettingsPutBodyType {
    /**
     * A limit on how many automatic dependency upgrade PRs can be opened simultaneously
     */
    autoDepUpgradeLimit?: number;
    /**
     * A list of strings defining what dependencies should be ignored
     */
    autoDepUpgradeIgnoredDependencies?: string[];
    /**
     * Defines if the functionality is enabled
     */
    autoDepUpgradeEnabled?: boolean;
    /**
     * The age (in days) that an automatic dependency check is valid for
     */
    autoDepUpgradeMinAge?: number;
    /**
     * If an opened PR should fail to be validated if any vulnerable dependencies have been detected
     */
    pullRequestFailOnAnyVulns?: boolean;
    /**
     * If an opened PR only should fail its validation if any dependencies are marked as being of high severity
     */
    pullRequestFailOnlyForHighSeverity?: boolean;
    /**
     * If opened PRs should be tested
     */
    pullRequestTestEnabled?: boolean;
    /**
     * assign Snyk pull requests
     */
    pullRequestAssignment?: {
      /**
       * if the organization's project(s) will assign Snyk pull requests.
       */
      enabled?: boolean;
      /**
       * a string representing the type of assignment your projects require.
       */
      type?: 'auto' | 'manual';
      /**
       * an array of usernames that have contributed to the organization's project(s).
       */
      assignees?: string[];
    };
    /**
     * Defines automatic remediation policies
     */
    autoRemediationPrs?: {
      /**
       * If true, allows automatic remediation of prioritized backlog issues
       */
      backlogPrsEnabled?: boolean;
      /**
       * Determine which issues are fixed in a backlog PR
       */
      backlogPrStrategy?: 'vuln' | 'dependency';
      /**
       * If true, allows automatic remediation of newly identified issues, or older issues where a fix has been identified
       */
      freshPrsEnabled?: boolean;
      /**
       * If true, allows using patched remediation
       */
      usePatchRemediation?: boolean;
    };
    /**
     * Defines manual remediation policies
     */
    manualRemediationPrs?: {
      /**
       * If true, allows using patched remediation
       */
      usePatchRemediation?: boolean;
    };
    /**
     * If true, will automatically detect and scan Dockerfiles in your Git repositories, surface base image vulnerabilities and recommend possible fixes
     */
    dockerfileSCMEnabled?: boolean;
  }
  export interface SettingsGetResponseType {
    /**
     * A limit on how many automatic dependency upgrade PRs can be opened simultaneously
     */
    autoDepUpgradeLimit?: number;
    /**
     * A list of strings defining what dependencies should be ignored
     */
    autoDepUpgradeIgnoredDependencies?: {
      [key: string]: any;
    }[];
    /**
     * Defines if the functionality is enabled
     */
    autoDepUpgradeEnabled?: boolean;
    /**
     * The age (in days) that an automatic dependency check is valid for
     */
    autoDepUpgradeMinAge?: number;
    /**
     * If an opened PR should fail to be validated if any vulnerable dependencies have been detected
     */
    pullRequestFailOnAnyVulns?: boolean;
    /**
     * If an opened PR only should fail its validation if any dependencies are marked as being of high severity
     */
    pullRequestFailOnlyForHighSeverity?: boolean;
    /**
     * If opened PRs should be tested
     */
    pullRequestTestEnabled?: boolean;
    /**
     * assign Snyk pull requests
     */
    pullRequestAssignment?: {
      /**
       * if the organization's project(s) will assign Snyk pull requests.
       */
      enabled?: boolean;
      /**
       * a string representing the type of assignment your projects require.
       */
      type?: 'auto' | 'manual';
      /**
       * an array of usernames that have contributed to the organization's project(s).
       */
      assignees?: {
        [key: string]: any;
      }[];
    };
    /**
     * Defines automatic remediation policies
     */
    autoRemediationPrs?: {
      /**
       * If true, allows automatic remediation of prioritized backlog issues
       */
      backlogPrsEnabled?: boolean;
      /**
       * Determine which issues are fixed in a backlog PR
       */
      backlogPrStrategy?: 'vuln' | 'dependency';
      /**
       * If true, allows automatic remediation of newly identified issues, or older issues where a fix has been identified
       */
      freshPrsEnabled?: boolean;
      /**
       * If true, allows using patched remediation
       */
      usePatchRemediation?: boolean;
    };
    /**
     * Defines manual remediation policies
     */
    manualRemediationPrs?: {
      /**
       * If true, allows using patched remediation
       */
      usePatchRemediation?: boolean;
    };
    /**
     * If true, will automatically detect and scan Dockerfiles in your Git repositories, surface base image vulnerabilities and recommend possible fixes
     */
    dockerfileSCMEnabled?: boolean;
  }
  export interface SettingsPutResponseType {
    /**
     * A limit on how many automatic dependency upgrade PRs can be opened simultaneously
     */
    autoDepUpgradeLimit?: number;
    /**
     * A list of strings defining what dependencies should be ignored
     */
    autoDepUpgradeIgnoredDependencies?: {
      [key: string]: any;
    }[];
    /**
     * Defines if the functionality is enabled
     */
    autoDepUpgradeEnabled?: boolean;
    /**
     * The age (in days) that an automatic dependency check is valid for
     */
    autoDepUpgradeMinAge?: number;
    /**
     * If an opened PR should fail to be validated if any vulnerable dependencies have been detected
     */
    pullRequestFailOnAnyVulns?: boolean;
    /**
     * If an opened PR only should fail its validation if any dependencies are marked as being of high severity
     */
    pullRequestFailOnlyForHighSeverity?: boolean;
    /**
     * If opened PRs should be tested
     */
    pullRequestTestEnabled?: boolean;
    /**
     * assign Snyk pull requests
     */
    pullRequestAssignment?: {
      /**
       * if the organization's project(s) will assign Snyk pull requests.
       */
      enabled?: boolean;
      /**
       * a string representing the type of assignment your projects require.
       */
      type?: 'auto' | 'manual';
      /**
       * an array of usernames that have contributed to the organization's project(s).
       */
      assignees?: {
        [key: string]: any;
      }[];
    };
    /**
     * Defines automatic remediation policies
     */
    autoRemediationPrs?: {
      /**
       * If true, allows automatic remediation of prioritized backlog issues
       */
      backlogPrsEnabled?: boolean;
      /**
       * Determine which issues are fixed in a backlog PR
       */
      backlogPrStrategy?: 'vuln' | 'dependency';
      /**
       * If true, allows automatic remediation of newly identified issues, or older issues where a fix has been identified
       */
      freshPrsEnabled?: boolean;
      /**
       * If true, allows using patched remediation
       */
      usePatchRemediation?: boolean;
    };
    /**
     * Defines manual remediation policies
     */
    manualRemediationPrs?: {
      /**
       * If true, allows using patched remediation
       */
      usePatchRemediation?: boolean;
    };
    /**
     * If true, will automatically detect and scan Dockerfiles in your Git repositories, surface base image vulnerabilities and recommend possible fixes
     */
    dockerfileSCMEnabled?: boolean;
  }
  export namespace Settings {
    class Settings {
      private currentContext;
      constructor(parentContext: Object, fullResponse?: boolean);
      get(): Promise<SettingsGetResponseType>;
      put(body: SettingsPutBodyType): Promise<SettingsPutResponseType>;
    }
  }
  interface importClass {
    jobId: string;
  }
  export type ImportPostBodyType = ImportPostBodyType1 &
    ImportPostBodyType2 &
    ImportPostBodyType3 &
    ImportPostBodyType4 &
    ImportPostBodyType5 &
    ImportPostBodyType6 &
    ImportPostBodyType7 &
    ImportPostBodyType8 &
    ImportPostBodyType9 &
    ImportPostBodyType10;
  interface ImportPostBodyType1 {
    target?: {
      /**
       * for Github: account owner of the repository; for Azure Repos, this is `Project ID`
       */
      owner: string;
      /**
       * name of the repo
       */
      name: string;
      /**
       * default branch of the repo (Please contact support if you want to import a non default repo branch)
       */
      branch: string;
    };
    /**
     * an array of file objects
     */
    files?: string[];
    /**
     * a comma-separated list of up to 10 folder names to exclude from scanning (each folder name must not exceed 100 characters). If not specified, it will default to "fixtures, tests, \_\_tests\_\_, node_modules". If an empty string is provided - no folders will be excluded. This attribute is only respected with Open Source and Container scan targets.
     */
    exclusionGlobs?: string;
  }
  interface ImportPostBodyType2 {
    target?: {
      /**
       * id of the repo
       */
      id: number;
      /**
       * repo branch
       */
      branch: string;
    };
    /**
     * an array of file objects
     */
    files?: string[];
    /**
     * a comma-separated list of up to 10 folder names to exclude from scanning. If not specified, it will default to "fixtures, tests, \_\_tests\_\_, node_modules". If an empty string is provided - no folders will be excluded. This attribute is only respected with Open Source and Container scan targets.
     */
    exclusionGlobs?: string;
  }
  interface ImportPostBodyType3 {
    target?: {
      /**
       * this is the `Workspace ID`
       */
      owner: string;
      /**
       * name of the repo
       */
      name: string;
    };
    /**
     * an array of file objects
     */
    files?: string[];
    /**
     * a comma-separated list of up to 10 folder names to exclude from scanning (each folder name must not exceed 100 characters). If not specified, it will default to "fixtures, tests, \_\_tests\_\_, node_modules". If an empty string is provided - no folders will be excluded. This attribute is only respected with Open Source and Container scan targets.
     */
    exclusionGlobs?: string;
  }
  interface ImportPostBodyType4 {
    target?: {
      /**
       * project key
       */
      projectKey: string;
      /**
       * slug of the repo
       */
      repoSlug: string;
      /**
       * custom name for the project
       */
      name?: string;
      /**
       * target branch name
       */
      branch?: string;
    };
    /**
     * an array of file objects
     */
    files?: string[];
    /**
     * a comma-separated list of up to 10 folder names to exclude from scanning. If not specified, it will default to "fixtures, tests, \_\_tests\_\_, node_modules". If an empty string is provided - no folders will be excluded. This attribute is only respected with Open Source and Container scan targets.
     */
    exclusionGlobs?: string;
  }
  interface ImportPostBodyType5 {
    target?: {
      /**
       * ID of the app
       */
      appId: string;
      /**
       * ID of the slug
       */
      slugId: string;
    };
    /**
     * an array of file objects
     */
    files?: string[];
  }
  interface ImportPostBodyType6 {
    target?: {
      /**
       * ID of the app
       */
      functionId: string;
    };
    /**
     * an array of file objects
     */
    files?: string[];
  }
  interface ImportPostBodyType7 {
    target?: {
      /**
       * ID of the app
       */
      appId: string;
    };
    /**
     * an array of file objects
     */
    files?: string[];
  }
  interface ImportPostBodyType8 {
    target?: {
      /**
       * image name including tag prefixed by organization name
       */
      name: string;
    };
  }
  interface ImportPostBodyType9 {
    target?: {
      /**
       * image name including tag
       */
      name: string;
    };
  }
  interface ImportPostBodyType10 {
    target?: {
      /**
       * image name including tag prefixed by project id or project name
       */
      name: string;
    };
  }
  export interface ImportPostResponseType {
    header: undefined;
  }
  export interface ImportGetResponseType {
    /**
     * A uuid representing the job's id
     */
    id?: string;
    /**
     * a string representing the status of a job.
     *
     * One of: pending, failed, aborted or complete.
     */
    status?: string;
    /**
     * the time when an import job was created represented as a [UTC (ISO-8601)](https://tools.ietf.org/html/rfc3339) string
     */
    created?: string;
    /**
     * all organizations imported by the job
     */
    logs?: {
      [key: string]: any;
    }[];
  }
  export namespace Import {
    class Import {
      private currentContext;
      private jobId;
      constructor(
        parentContext: Object,
        Importparam: importClass,
        fullResponse?: boolean,
      );
      post(body: ImportPostBodyType): Promise<ImportPostResponseType>;
      get(): Promise<ImportGetResponseType>;
    }
  }
  export {};
}
export interface ProjectsPostBodyType {
  filters?: {
    /**
     * If supplied, only projects that have a name that **starts with** this value will be returned
     */
    name?: string;
    /**
     * If supplied, only projects that exactly match this origin will be returned
     */
    origin?: string;
    /**
     * If supplied, only projects that exactly match this type will be returned
     */
    type?: string;
    /**
     * If set to `true`, only include projects which are monitored, if set to `false`, only include projects which are not monitored
     */
    isMonitored?: boolean;
    tags?: {
      /**
       * A project must have all provided tags in order to be included in the response. A maximum of 3 tags can be supplied.
       */
      includes?: string[];
    };
    /**
     * When you filter by multiple values on a single attribute, you will return projects that have been assigned one or more of the values in the filter.
     *
     * When you filter by multiple attributes, you will return projects which have been assigned values of both attributes in the filter.
     */
    attributes?: {
      criticality?: string[];
      environment?: string[];
      lifecycle?: string[];
    };
  };
}
export interface ProjectsPostResponseType {
  org?: {
    name?: string;
    /**
     * The identifier of the org
     */
    id?: string;
  };
  /**
   * A list of org's projects
   */
  projects?: {
    name?: string;
    /**
     * The project identifier
     */
    id?: string;
    /**
     * The date that the project was created on
     */
    created?: string;
    /**
     * The origin the project was added from
     */
    origin?: string;
    /**
     * The package manager of the project
     */
    type?: string;
    /**
     * Whether the project is read-only
     */
    readOnly?: boolean;
    /**
     * The frequency of automated Snyk re-test. Can be 'daily', 'weekly or 'never'
     */
    testFrequency?: string;
    /**
     * Number of dependencies of the project
     */
    totalDependencies?: number;
    /**
     * Number of known vulnerabilities in the project, not including ignored issues
     */
    issueCountsBySeverity?: {
      /**
       * Number of low severity vulnerabilities
       */
      low?: number;
      /**
       * Number of medium severity vulnerabilities
       */
      medium?: number;
      /**
       * Number of high severity vulnerabilities
       */
      high?: number;
      /**
       * Number of critical severity vulnerabilities
       */
      critical?: number;
    };
    /**
     * For docker projects shows the ID of the image
     */
    imageId?: string;
    /**
     * For docker projects shows the tag of the image
     */
    imageTag?: string;
    /**
     * For docker projects shows the base image
     */
    imageBaseImage?: string;
    /**
     * For docker projects shows the platform of the image
     */
    imagePlatform?: string;
    /**
     * For Kubernetes projects shows the origin cluster name
     */
    imageCluster?: string;
    /**
     * The project remote repository url. Only set for projects imported via the Snyk CLI tool.
     */
    remoteRepoUrl?: string;
    /**
     * The date on which the most recent test was conducted for this project
     */
    lastTestedDate?: string;
    /**
     * The user who owns the project, null if not set
     *
     * {
     *     "id": "e713cf94-bb02-4ea0-89d9-613cce0caed2",
     *     "name": "example-user@snyk.io",
     *     "username": "exampleUser",
     *     "email": "example-user@snyk.io"
     * }
     */
    owner?: object | null;
    /**
     * URL with project overview
     */
    browseUrl?: string;
    /**
     * The user who imported the project
     */
    importingUser?: {
      /**
       * The ID of the user.
       */
      id?: string;
      /**
       * The name of the user.
       */
      name?: string;
      /**
       * The username of the user.
       */
      username?: string;
      /**
       * The email of the user.
       */
      email?: string;
    };
    /**
     * Describes if a project is currently monitored or it is de-activated
     */
    isMonitored?: boolean;
    /**
     * The monitored branch (if available)
     */
    branch?: string | null;
    /**
     * The identifier for which revision of the resource is scanned by Snyk. For example this may be a branch for SCM project, or a tag for a container image
     */
    targetReference?: string | null;
    /**
     * List of applied tags
     */
    tags?: string[];
    /**
     * Applied project attributes
     */
    attributes?: {
      criticality?: string[];
      environment?: string[];
      lifecycle?: string[];
    };
  }[];
}
export declare namespace Projects {
  class Projects {
    private currentContext;
    constructor(parentContext: Object, fullResponse?: boolean);
    post(body: ProjectsPostBodyType): Promise<ProjectsPostResponseType>;
    getV3(): Promise<ProjectsPostResponseType>;
  }
}
interface projectClass {
  projectId: string;
}
export interface ProjectPutBodyType {
  /**
   * Set to `null` to remove all ownership. User must be a member of the same organization as the project.
   */
  owner?: {
    /**
     * A user to assign as the project owner.
     */
    id?: string;
  };
  /**
   * The branch that this project should be monitoring
   *
   * {
   *     "owner": {
   *         "id": "1acd4d09-5602-4d04-9640-045fe928aaea"
   *     },
   *     "branch": "main"
   * }
   */
  branch?: string;
}
export interface ProjectGetResponseType {
  name?: string;
  /**
   * The project identifier
   */
  id?: string;
  /**
   * The date that the project was created on
   */
  created?: string;
  /**
   * The origin the project was added from
   */
  origin?: string;
  /**
   * The package manager of the project
   */
  type?: string;
  /**
   * Whether the project is read-only
   */
  readOnly?: boolean;
  /**
   * The frequency of automated Snyk re-test. Can be 'daily', 'weekly or 'never'
   */
  testFrequency?: string;
  /**
   * Number of dependencies of the project
   */
  totalDependencies?: number;
  /**
   * Number of known vulnerabilities in the project, not including ignored issues
   */
  issueCountsBySeverity?: {
    /**
     * Number of low severity vulnerabilities
     */
    low?: number;
    /**
     * Number of medium severity vulnerabilities
     */
    medium?: number;
    /**
     * Number of high severity vulnerabilities
     */
    high?: number;
    /**
     * Number of critical severity vulnerabilities
     */
    critical?: number;
  };
  /**
   * For docker projects shows the ID of the image
   */
  imageId?: string;
  /**
   * For docker projects shows the tag of the image
   */
  imageTag?: string;
  /**
   * For docker projects shows the base image
   */
  imageBaseImage?: string;
  /**
   * For docker projects shows the platform of the image
   */
  imagePlatform?: string;
  /**
   * For Kubernetes projects shows the origin cluster name
   */
  imageCluster?: string;
  /**
   * The hostname for a CLI project, null if not set
   */
  hostname?: string | null;
  /**
   * The project remote repository url. Only set for projects imported via the Snyk CLI tool.
   */
  remoteRepoUrl?: string;
  /**
   * The date on which the most recent test was conducted for this project
   */
  lastTestedDate?: string;
  /**
   * The user who owns the project, null if not set
   *
   * {
   *     "id": "e713cf94-bb02-4ea0-89d9-613cce0caed2",
   *     "name": "example-user@snyk.io",
   *     "username": "exampleUser",
   *     "email": "example-user@snyk.io"
   * }
   */
  owner?: object | null;
  /**
   * URL with project overview
   */
  browseUrl?: string;
  /**
   * The user who imported the project
   */
  importingUser?: {
    /**
     * The ID of the user.
     */
    id?: string;
    /**
     * The name of the user.
     */
    name?: string;
    /**
     * The username of the user.
     */
    username?: string;
    /**
     * The email of the user.
     */
    email?: string;
  };
  /**
   * Describes if a project is currently monitored or it is de-activated
   */
  isMonitored?: boolean;
  /**
   * The monitored branch (if available)
   */
  branch?: string | null;
  /**
   * The identifier for which revision of the resource is scanned by Snyk. For example this may be a branch for SCM project, or a tag for a container image
   */
  targetReference?: string | null;
  /**
   * List of applied tags
   */
  tags?: {
    [key: string]: any;
  }[];
  /**
   * Applied project attributes
   */
  attributes?: {
    criticality?: {
      [key: string]: any;
    }[];
    environment?: {
      [key: string]: any;
    }[];
    lifecycle?: {
      [key: string]: any;
    }[];
  };
  /**
   * Remediation data (if available)
   */
  remediation?: {
    /**
     * Recommended upgrades to apply to the project
     *
     * (object)
     *     + upgradeTo (string, required) - `package@version` to upgrade to
     *     + upgrades (array[string], required) -  List of `package@version` that will be upgraded as part of this upgrade
     *     + vulns (array[string], required) - List of vulnerability ids that will be fixed as part of this upgrade
     */
    upgrade?: {
      [key: string]: any;
    };
    /**
     * Recommended patches to apply to the project
     *
     * (object)
     *    paths (array) - List of paths to the vulnerable dependency that can be patched
     */
    patch?: {
      [key: string]: any;
    };
    /**
     * Recommended pins to apply to the project (Python only)
     *
     * (object)
     *     + upgradeTo (string, required) - `package@version` to upgrade to
     *     + vulns (array[string], required) - List of vulnerability ids that will be fixed as part of this upgrade
     *     + isTransitive (boolean) - Describes if the dependency to be pinned is a transitive dependency
     */
    pin?: {
      [key: string]: any;
    };
  };
}
export interface ProjectPutResponseType {
  name?: string;
  /**
   * The project identifier
   */
  id?: string;
  /**
   * The date that the project was created on
   */
  created?: string;
  /**
   * The origin the project was added from
   */
  origin?: string;
  /**
   * The package manager of the project
   */
  type?: string;
  /**
   * Whether the project is read-only
   */
  readOnly?: boolean;
  /**
   * The frequency of automated Snyk re-test. Can be 'daily', 'weekly or 'never'
   */
  testFrequency?: string;
  /**
   * Number of dependencies of the project
   */
  totalDependencies?: number;
  /**
   * Number of known vulnerabilities in the project, not including ignored issues
   */
  issueCountsBySeverity?: {
    /**
     * Number of low severity vulnerabilities
     */
    low?: number;
    /**
     * Number of medium severity vulnerabilities
     */
    medium?: number;
    /**
     * Number of high severity vulnerabilities
     */
    high?: number;
    /**
     * Number of critical severity vulnerabilities
     */
    critical?: number;
  };
  /**
   * For docker projects shows the ID of the image
   */
  imageId?: string;
  /**
   * For docker projects shows the tag of the image
   */
  imageTag?: string;
  /**
   * For docker projects shows the base image
   */
  imageBaseImage?: string;
  /**
   * For docker projects shows the platform of the image
   */
  imagePlatform?: string;
  /**
   * For Kubernetes projects shows the origin cluster name
   */
  imageCluster?: string;
  /**
   * The hostname for a CLI project, null if not set
   */
  hostname?: string | null;
  /**
   * The project remote repository url. Only set for projects imported via the Snyk CLI tool.
   */
  remoteRepoUrl?: string;
  /**
   * The date on which the most recent test was conducted for this project
   */
  lastTestedDate?: string;
  /**
   * The user who owns the project, null if not set
   *
   * {
   *     "id": "e713cf94-bb02-4ea0-89d9-613cce0caed2",
   *     "name": "example-user@snyk.io",
   *     "username": "exampleUser",
   *     "email": "example-user@snyk.io"
   * }
   */
  owner?: object | null;
  /**
   * URL with project overview
   */
  browseUrl?: string;
  /**
   * The user who imported the project
   */
  importingUser?: {
    /**
     * The ID of the user.
     */
    id?: string;
    /**
     * The name of the user.
     */
    name?: string;
    /**
     * The username of the user.
     */
    username?: string;
    /**
     * The email of the user.
     */
    email?: string;
  };
  /**
   * Describes if a project is currently monitored or it is de-activated
   */
  isMonitored?: boolean;
  /**
   * The monitored branch (if available)
   */
  branch?: string | null;
  /**
   * The identifier for which revision of the resource is scanned by Snyk. For example this may be a branch for SCM project, or a tag for a container image
   */
  targetReference?: string | null;
  /**
   * List of applied tags
   */
  tags?: {
    [key: string]: any;
  }[];
  /**
   * Applied project attributes
   */
  attributes?: {
    criticality?: {
      [key: string]: any;
    }[];
    environment?: {
      [key: string]: any;
    }[];
    lifecycle?: {
      [key: string]: any;
    }[];
  };
  /**
   * Remediation data (if available)
   */
  remediation?: {
    /**
     * Recommended upgrades to apply to the project
     *
     * (object)
     *     + upgradeTo (string, required) - `package@version` to upgrade to
     *     + upgrades (array[string], required) -  List of `package@version` that will be upgraded as part of this upgrade
     *     + vulns (array[string], required) - List of vulnerability ids that will be fixed as part of this upgrade
     */
    upgrade?: {
      [key: string]: any;
    };
    /**
     * Recommended patches to apply to the project
     *
     * (object)
     *    paths (array) - List of paths to the vulnerable dependency that can be patched
     */
    patch?: {
      [key: string]: any;
    };
    /**
     * Recommended pins to apply to the project (Python only)
     *
     * (object)
     *     + upgradeTo (string, required) - `package@version` to upgrade to
     *     + vulns (array[string], required) - List of vulnerability ids that will be fixed as part of this upgrade
     *     + isTransitive (boolean) - Describes if the dependency to be pinned is a transitive dependency
     */
    pin?: {
      [key: string]: any;
    };
  };
}
export declare type ProjectDeleteResponseType = any;
export declare namespace Project {
  export class Project {
    private currentContext;
    private projectId;
    deactivate: Deactivate.Deactivate;
    activate: Activate.Activate;
    aggregatedissues: Aggregatedissues.Aggregatedissues;
    depgraph: Depgraph.Depgraph;
    ignores: Ignores.Ignores;
    jiraissues: Jiraissues.Jiraissues;
    settings: Settings.Settings;
    move: Move.Move;
    tags: Tags.Tags;
    attributes: Attributes.Attributes;
    constructor(
      parentContext: Object,
      Projectparam: projectClass,
      fullResponse?: boolean,
    );
    issue(Issueparam?: issueClass): Issue.Issue;
    history(Historyparam?: historyClass): History.History;
    ignore(Ignoreparam?: ignoreClass): Ignore.Ignore;
    get(): Promise<ProjectGetResponseType>;
    put(body: ProjectPutBodyType): Promise<ProjectPutResponseType>;
    delete(): Promise<any>;
  }
  export type DeactivatePostResponseType = any;
  export namespace Deactivate {
    class Deactivate {
      private currentContext;
      constructor(parentContext: Object, fullResponse?: boolean);
      post(): Promise<any>;
    }
  }
  export type ActivatePostResponseType = any;
  export namespace Activate {
    class Activate {
      private currentContext;
      constructor(parentContext: Object, fullResponse?: boolean);
      post(): Promise<any>;
    }
  }
  export interface AggregatedissuesPostBodyType {
    /**
     * If set to `true`, Include issue's description, if set to `false` (by default), it won't (Non-IaC projects only)
     */
    includeDescription?: boolean;
    /**
     * If set to `true`, Include issue's introducedThrough, if set to `false` (by default), it won't. It's for container only projects (Non-IaC projects only)
     */
    includeIntroducedThrough?: boolean;
    filters?: {
      /**
       * The severity levels of issues to filter the results by
       */
      severities?: string[];
      /**
       * The exploit maturity levels of issues to filter the results by (Non-IaC projects only)
       */
      exploitMaturity?: string[];
      /**
       * The type of issues to filter the results by (Non-IaC projects only)
       */
      types?: string[];
      /**
       * If set to `true`, only include issues which are ignored, if set to `false`, only include issues which are not ignored
       */
      ignored?: boolean;
      /**
       * If set to `true`, only include issues which are patched, if set to `false`, only include issues which are not patched (Non-IaC projects only)
       */
      patched?: boolean;
      /**
       * The priority to filter the issues by (Non-IaC projects only)
       */
      priority?: {
        /**
         * Include issues where the priority score is between min and max
         */
        score?: {
          min?: number;
          max?: number;
        };
      };
    };
  }
  export interface AggregatedissuesPostResponseType {
    /**
     * An array of identified issues
     */
    issues?: {
      /**
       * The identifier of the issue
       */
      id: string;
      /**
       * type of the issue ('vuln', 'license' or 'configuration')
       */
      issueType: string;
      /**
       * The package name (Non-IaC projects only)
       */
      pkgName: string;
      /**
       * List of affected package versions (Non-IaC projects only)
       */
      pkgVersions: string[];
      /**
       * The details of the issue
       */
      issueData: {
        /**
         * The identifier of the issue
         */
        id: string;
        /**
         * The issue title
         */
        title: string;
        /**
         * The severity status of the issue, after policies are applied
         */
        severity: string;
        /**
         * The original severity status of the issue, as retrieved from Snyk Vulnerability database, before policies are applied
         */
        originalSeverity: string;
        /**
         * URL to a page containing information about the issue
         */
        url: string;
        description: string;
        /**
         * External identifiers assigned to the issue (Non-IaC projects only)
         */
        identifiers: {
          /**
           * Common Vulnerability Enumeration identifiers
           */
          CVE?: string[];
          /**
           * Common Weakness Enumeration identifiers
           */
          CWE?: string[];
          /**
           * Identifiers assigned by the Open Source Vulnerability Database (OSVDB)
           */
          OSVDB?: string[];
        };
        /**
         * The list of people responsible for first uncovering or reporting the issue (Non-IaC projects only)
         */
        credit: string[];
        /**
         * The exploit maturity of the issue
         */
        exploitMaturity: string;
        /**
         * The ranges that are vulnerable and unaffected by the issue (Non-IaC projects only)
         */
        semver: {
          /**
           * The ranges that are vulnerable to the issue. May be an array or a string.
           */
          vulnerable?: string[];
          /**
           * The ranges that are unaffected by the issue
           */
          unaffected?: string;
        };
        /**
         * The date that the vulnerability was first published by Snyk (Non-IaC projects only)
         */
        publicationTime: string;
        /**
         * The date that the vulnerability was first disclosed
         */
        disclosureTime: string;
        /**
         * The CVSS v3 string that signifies how the CVSS score was calculated (Non-IaC projects only)
         */
        CVSSv3: string;
        /**
         * The CVSS score that results from running the CVSSv3 string (Non-IaC projects only)
         */
        cvssScore: number;
        /**
         * The language of the issue (Non-IaC projects only)
         */
        language: string;
        /**
         * A list of patches available for the given issue (Non-IaC projects only)
         */
        patches: string[];
        /**
         * Nearest version which includes a fix for the issue. This is populated for container projects only. (Non-IaC projects only)
         */
        nearestFixedInVersion: string;
        /**
         * Path to the resource property violating the policy within the scanned project. (IaC projects only)
         */
        path: string;
        /**
         * The ID of the violated policy in the issue (IaC projects only)
         */
        violatedPolicyPublicId: string;
        /**
         * Whether the issue is intentional, indicating a malicious package
         */
        isMaliciousPackage: boolean;
      };
      /**
       * The list of what introduced the issue (it is available only for container project with Dockerfile)
       */
      introducedThrough?: string[];
      /**
       * Whether the issue has been patched (Non-IaC projects only)
       */
      isPatched: boolean;
      /**
       * Whether the issue has been ignored
       */
      isIgnored: boolean;
      /**
       * The list of reasons why the issue was ignored
       */
      ignoreReasons?: string[];
      /**
       * Information about fix/upgrade/pinnable options for the issue (Non-IaC projects only)
       */
      fixInfo?: {
        /**
         * Whether all of the issue's paths are upgradable
         */
        isUpgradable?: boolean;
        /**
         * Whether the issue can be fixed by pinning a transitive
         */
        isPinnable?: boolean;
        /**
         * Whether all the of issue's paths are patchable
         */
        isPatchable?: boolean;
        /**
         * Whether all of the issue's paths are fixable. Paths that are already patched are not considered fixable unless they have an alternative remediation (e.g. pinning or upgrading). An upgrade path where the only changes are in transitive dependencies is only considered fixable if the package manager supports it.
         */
        isFixable?: boolean;
        /**
         * Whether any of the issue's paths can be fixed. Paths that are already patched are not considered fixable unless they have an alternative remediation (e.g. pinning or upgrading).  An upgrade path where the only changes are in transitive dependencies is only considered fixable if the package manager supports it.
         */
        isPartiallyFixable?: boolean;
        /**
         * Nearest version which includes a fix for the issue. This is populated for container projects only.
         */
        nearestFixedInVersion?: string;
        /**
         * The set of versions in which this issue has been fixed. If the issue spanned multiple versions (i.e. `1.x` and `2.x`) then there will be multiple `fixedIn` entries
         */
        fixedIn?: string[];
      };
      /**
       * Information about the priority of the issue (Non-IaC projects only)
       */
      priority?: {
        /**
         * The priority score of the issue
         */
        score?: number;
        /**
         * The list of factors that contributed to the priority of the issue
         */
        factors?: string[];
      };
      /**
       * Onward links from this record (Non-IaC projects only)
       */
      links?: {
        /**
         * The URL for the dependency paths that introduce this issue
         */
        paths?: string;
      };
    }[];
  }
  export namespace Aggregatedissues {
    class Aggregatedissues {
      private currentContext;
      constructor(parentContext: Object, fullResponse?: boolean);
      post(
        body: AggregatedissuesPostBodyType,
      ): Promise<AggregatedissuesPostResponseType>;
      getAggregatedIssuesWithVulnPaths(
        body: Project.AggregatedissuesPostBodyType,
      ): Promise<AggregatedIssuesWithVulnPaths>;
    }
  }
  interface issueClass {
    issueId: string;
  }
  export namespace Issue {
    class Issue {
      private currentContext;
      private issueId;
      paths: Paths.Paths;
      jiraissue: Jiraissue.Jiraissue;
      constructor(
        parentContext: Object,
        Issueparam: issueClass,
        fullResponse?: boolean,
      );
    }
    interface PathsGetResponseType {
      /**
       * The identifier of the snapshot for which the paths have been found
       */
      snapshotId?: string;
      /**
       * A list of the dependency paths that introduce the issue
       */
      paths?: {
        /**
         * The package name
         */
        name?: string;
        /**
         * The package version
         */
        version?: string;
        /**
         * The version to upgrade the package to in order to resolve the issue. This will only appear on the first element of the path, and only if the issue can be fixed by upgrading packages. Note that if the fix requires upgrading transitive dependencies, `fixVersion` will be the same as `version`.
         */
        fixVersion?: string;
      }[][];
      /**
       * The total number of results
       */
      total?: number;
      /**
       * Onward links from this record
       */
      links?: {
        /**
         * The URL of the previous page of paths for the issue, if not on the first page
         */
        prev?: string;
        /**
         * The URL of the next page of paths for the issue, if not on the last page
         */
        next?: string;
        /**
         * The URL of the last page of paths for the issue
         */
        last?: string;
      };
    }
    namespace Paths {
      class Paths {
        private currentContext;
        constructor(parentContext: Object, fullResponse?: boolean);
        get(
          snapshotId?: string,
          perPage?: number,
          page?: number,
        ): Promise<PathsGetResponseType>;
        getAll(
          snapshotId?: string,
          noLimitMode?: boolean,
        ): Promise<PathsGetResponseType[]>;
      }
    }
    interface JiraissuePostBodyType {
      fields?: {
        /**
         * See https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-post for details of what to send as fields.
         */
        project?: {
          [key: string]: any;
        };
        /**
         * See https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-post for details of what to send as fields.
         */
        issuetype?: {
          [key: string]: any;
        };
        /**
         * See https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-post for details of what to send as fields.
         */
        summary?: string;
      };
    }
    interface JiraissuePostResponseType {
      /**
       * The details about the jira issue.
       */
      jiraIssue?: {
        /**
         * The id of the issue in Jira.
         */
        id?: string;
        /**
         * The key of the issue in Jira.
         */
        key?: string;
      };
    }
    namespace Jiraissue {
      class Jiraissue {
        private currentContext;
        constructor(parentContext: Object, fullResponse?: boolean);
        post(body: JiraissuePostBodyType): Promise<JiraissuePostResponseType>;
      }
    }
  }
  interface historyClass {
    snapshotId: string;
  }
  export interface HistoryPostBodyType {
    filters?: {
      /**
       * For container projects, filter by the ID of the image
       */
      imageId?: string;
    };
  }
  export interface HistoryPostResponseType {
    /**
     * A list of the project's snapshots, ordered according to date (latest first).
     */
    snapshots?: {
      /**
       * The snapshot identifier
       */
      id: string;
      /**
       * The date that the snapshot was taken
       */
      created: string;
      /**
       * Number of dependencies of the project
       */
      totalDependencies: number;
      /**
       * Number of known vulnerabilities in the project, not including ignored issues
       */
      issueCounts: {
        vuln?: {
          /**
           * Number of low severity vulnerabilities
           */
          low: number;
          /**
           * Number of medium severity vulnerabilities
           */
          medium: number;
          /**
           * Number of high severity vulnerabilities
           */
          high: number;
          /**
           * Number of critical severity vulnerabilities
           */
          critical: number;
        };
        license?: {
          /**
           * Number of low severity vulnerabilities
           */
          low: number;
          /**
           * Number of medium severity vulnerabilities
           */
          medium: number;
          /**
           * Number of high severity vulnerabilities
           */
          high: number;
          /**
           * Number of critical severity vulnerabilities
           */
          critical: number;
        };
        sast?: {
          /**
           * Number of low severity vulnerabilities
           */
          low: number;
          /**
           * Number of medium severity vulnerabilities
           */
          medium: number;
          /**
           * Number of high severity vulnerabilities
           */
          high: number;
          /**
           * Number of critical severity vulnerabilities
           */
          critical: number;
        };
      };
      imageId?: string;
      imageTag?: string;
      imageBaseImage?: string;
      imagePlatform?: string;
      /**
       * The method by which this snapshot was created.
       */
      method?: 'api' | 'cli' | 'recurring' | 'web' | 'web-test' | 'wizard';
    }[];
    /**
     * The total number of results
     */
    total?: number;
  }
  export namespace History {
    export class History {
      private currentContext;
      private snapshotId;
      aggregatedissues: Aggregatedissues.Aggregatedissues;
      constructor(
        parentContext: Object,
        Historyparam: historyClass,
        fullResponse?: boolean,
      );
      issue(Issueparam?: issueClass): Issue.Issue;
      post(
        body: HistoryPostBodyType,
        perPage?: number,
        page?: number,
      ): Promise<HistoryPostResponseType>;
      postAll(
        body: HistoryPostBodyType,
        noLimitMode?: boolean,
      ): Promise<HistoryPostResponseType[]>;
    }
    export interface AggregatedissuesPostBodyType {
      /**
       * If set to `true`, Include issue's description, if set to `false` (by default), it won't (Non-IaC projects only)
       */
      includeDescription?: boolean;
      /**
       * If set to `true`, Include issue's introducedThrough, if set to `false` (by default), it won't. It's for container only projects (Non-IaC projects only)
       */
      includeIntroducedThrough?: boolean;
      filters?: {
        /**
         * The severity levels of issues to filter the results by
         */
        severities?: string[];
        /**
         * The exploit maturity levels of issues to filter the results by (Non-IaC projects only)
         */
        exploitMaturity?: string[];
        /**
         * The type of issues to filter the results by (Non-IaC projects only)
         */
        types?: string[];
        /**
         * If set to `true`, only include issues which are ignored, if set to `false`, only include issues which are not ignored
         */
        ignored?: boolean;
        /**
         * If set to `true`, only include issues which are patched, if set to `false`, only include issues which are not patched (Non-IaC projects only)
         */
        patched?: boolean;
        /**
         * The priority to filter the issues by (Non-IaC projects only)
         */
        priority?: {
          /**
           * Include issues where the priority score is between min and max
           */
          score?: {
            min?: number;
            max?: number;
          };
        };
      };
    }
    export interface AggregatedissuesPostResponseType {
      /**
       * An array of identified issues
       */
      issues?: {
        /**
         * The identifier of the issue
         */
        id: string;
        /**
         * type of the issue ('vuln', 'license' or 'configuration')
         */
        issueType: string;
        /**
         * The package name (Non-IaC projects only)
         */
        pkgName: string;
        /**
         * List of affected package versions (Non-IaC projects only)
         */
        pkgVersions: string[];
        /**
         * The details of the issue
         */
        issueData: {
          /**
           * The identifier of the issue
           */
          id: string;
          /**
           * The issue title
           */
          title: string;
          /**
           * The severity status of the issue, after policies are applied
           */
          severity: string;
          /**
           * The original severity status of the issue, as retrieved from Snyk Vulnerability database, before policies are applied
           */
          originalSeverity: string;
          /**
           * URL to a page containing information about the issue
           */
          url: string;
          description: string;
          /**
           * External identifiers assigned to the issue (Non-IaC projects only)
           */
          identifiers: {
            /**
             * Common Vulnerability Enumeration identifiers
             */
            CVE?: string[];
            /**
             * Common Weakness Enumeration identifiers
             */
            CWE?: string[];
            /**
             * Identifiers assigned by the Open Source Vulnerability Database (OSVDB)
             */
            OSVDB?: string[];
          };
          /**
           * The list of people responsible for first uncovering or reporting the issue (Non-IaC projects only)
           */
          credit: string[];
          /**
           * The exploit maturity of the issue
           */
          exploitMaturity: string;
          /**
           * The ranges that are vulnerable and unaffected by the issue (Non-IaC projects only)
           */
          semver: {
            /**
             * The ranges that are vulnerable to the issue. May be an array or a string.
             */
            vulnerable?: string[];
            /**
             * The ranges that are unaffected by the issue
             */
            unaffected?: string;
          };
          /**
           * The date that the vulnerability was first published by Snyk (Non-IaC projects only)
           */
          publicationTime: string;
          /**
           * The date that the vulnerability was first disclosed
           */
          disclosureTime: string;
          /**
           * The CVSS v3 string that signifies how the CVSS score was calculated (Non-IaC projects only)
           */
          CVSSv3: string;
          /**
           * The CVSS score that results from running the CVSSv3 string (Non-IaC projects only)
           */
          cvssScore: number;
          /**
           * The language of the issue (Non-IaC projects only)
           */
          language: string;
          /**
           * A list of patches available for the given issue (Non-IaC projects only)
           */
          patches: string[];
          /**
           * Nearest version which includes a fix for the issue. This is populated for container projects only. (Non-IaC projects only)
           */
          nearestFixedInVersion: string;
          /**
           * Path to the resource property violating the policy within the scanned project. (IaC projects only)
           */
          path: string;
          /**
           * The ID of the violated policy in the issue (IaC projects only)
           */
          violatedPolicyPublicId: string;
          /**
           * Whether the issue is intentional, indicating a malicious package
           */
          isMaliciousPackage: boolean;
        };
        /**
         * The list of what introduced the issue (it is available only for container project with Dockerfile)
         */
        introducedThrough?: string[];
        /**
         * Whether the issue has been patched (Non-IaC projects only)
         */
        isPatched: boolean;
        /**
         * Whether the issue has been ignored
         */
        isIgnored: boolean;
        /**
         * The list of reasons why the issue was ignored
         */
        ignoreReasons?: string[];
        /**
         * Information about fix/upgrade/pinnable options for the issue (Non-IaC projects only)
         */
        fixInfo?: {
          /**
           * Whether all of the issue's paths are upgradable
           */
          isUpgradable?: boolean;
          /**
           * Whether the issue can be fixed by pinning a transitive
           */
          isPinnable?: boolean;
          /**
           * Whether all the of issue's paths are patchable
           */
          isPatchable?: boolean;
          /**
           * Whether all of the issue's paths are fixable. Paths that are already patched are not considered fixable unless they have an alternative remediation (e.g. pinning or upgrading). An upgrade path where the only changes are in transitive dependencies is only considered fixable if the package manager supports it.
           */
          isFixable?: boolean;
          /**
           * Whether any of the issue's paths can be fixed. Paths that are already patched are not considered fixable unless they have an alternative remediation (e.g. pinning or upgrading).  An upgrade path where the only changes are in transitive dependencies is only considered fixable if the package manager supports it.
           */
          isPartiallyFixable?: boolean;
          /**
           * Nearest version which includes a fix for the issue. This is populated for container projects only.
           */
          nearestFixedInVersion?: string;
          /**
           * The set of versions in which this issue has been fixed. If the issue spanned multiple versions (i.e. `1.x` and `2.x`) then there will be multiple `fixedIn` entries
           */
          fixedIn?: string[];
        };
        /**
         * Information about the priority of the issue (Non-IaC projects only)
         */
        priority?: {
          /**
           * The priority score of the issue
           */
          score?: number;
          /**
           * The list of factors that contributed to the priority of the issue
           */
          factors?: string[];
        };
        /**
         * Onward links from this record (Non-IaC projects only)
         */
        links?: {
          /**
           * The URL for the dependency paths that introduce this issue
           */
          paths?: string;
        };
      }[];
    }
    export namespace Aggregatedissues {
      class Aggregatedissues {
        private currentContext;
        constructor(parentContext: Object, fullResponse?: boolean);
        post(
          body: AggregatedissuesPostBodyType,
        ): Promise<AggregatedissuesPostResponseType>;
        getAggregatedIssuesWithVulnPaths(
          body: Project.AggregatedissuesPostBodyType,
        ): Promise<AggregatedIssuesWithVulnPaths>;
      }
    }
    interface issueClass {
      issueId: string;
    }
    export namespace Issue {
      class Issue {
        private currentContext;
        private issueId;
        paths: Paths.Paths;
        constructor(
          parentContext: Object,
          Issueparam: issueClass,
          fullResponse?: boolean,
        );
      }
      interface PathsGetResponseType {
        /**
         * The identifier of the snapshot for which the paths have been found
         */
        snapshotId?: string;
        /**
         * A list of the dependency paths that introduce the issue
         */
        paths?: {
          /**
           * The package name
           */
          name?: string;
          /**
           * The package version
           */
          version?: string;
          /**
           * The version to upgrade the package to in order to resolve the issue. This will only appear on the first element of the path, and only if the issue can be fixed by upgrading packages. Note that if the fix requires upgrading transitive dependencies, `fixVersion` will be the same as `version`.
           */
          fixVersion?: string;
        }[][];
        /**
         * The total number of results
         */
        total?: number;
        /**
         * Onward links from this record
         */
        links?: {
          /**
           * The URL of the previous page of paths for the issue, if not on the first page
           */
          prev?: string;
          /**
           * The URL of the next page of paths for the issue, if not on the last page
           */
          next?: string;
          /**
           * The URL of the last page of paths for the issue
           */
          last?: string;
        };
      }
      namespace Paths {
        class Paths {
          private currentContext;
          constructor(parentContext: Object, fullResponse?: boolean);
          get(perPage?: number, page?: number): Promise<PathsGetResponseType>;
          getAll(noLimitMode?: boolean): Promise<PathsGetResponseType[]>;
        }
      }
    }
    export {};
  }
  export interface DepgraphGetResponseType {
    /**
     * The dependency-graph object
     */
    depGraph: {
      /**
       * The scheme version of the depGraph object
       */
      schemaVersion: string;
      /**
       * The package manager of the project
       */
      pkgManager: {
        /**
         * The name of the package manager
         */
        name: string;
        /**
         * The version of the package manager
         */
        version?: string;
        repositories?: {
          alias: string;
        }[];
      };
      /**
       * A list of dependencies in the project
       */
      pkgs: {
        /**
         * The internal id of the package
         */
        id: string;
        info: {
          /**
           * The name of the package
           */
          name: string;
          /**
           * The version of the package
           */
          version?: string;
        };
      }[];
      /**
       * A directional graph of the packages in the project
       */
      graph: {
        /**
         * The internal id of the root node
         */
        rootNodeId: string;
        /**
         * A list of the first-level packages
         */
        nodes?: {
          /**
           * The internal id of the node
           */
          nodeId: string;
          /**
           * The id of the package
           */
          pkgId: string;
          /**
           * A list of the direct dependencies of the package
           */
          deps: {
            /**
             * The id of the node
             */
            nodeId: string;
          }[];
        }[];
      };
    };
  }
  export namespace Depgraph {
    class Depgraph {
      private currentContext;
      constructor(parentContext: Object, fullResponse?: boolean);
      get(): Promise<DepgraphGetResponseType>;
    }
  }
  export interface IgnoresGetResponseType {
    ''?: string[];
  }
  export namespace Ignores {
    class Ignores {
      private currentContext;
      constructor(parentContext: Object, fullResponse?: boolean);
      get(): Promise<IgnoresGetResponseType>;
    }
  }
  interface ignoreClass {
    issueId: string;
  }
  export interface IgnorePostBodyType {
    /**
     * The path to ignore (default is `*` which represents all paths).
     */
    ignorePath?: string;
    /**
     * The reason that the issue was ignored.
     */
    reason?: string;
    /**
     * The classification of the ignore.
     */
    reasonType: 'not-vulnerable' | 'wont-fix' | 'temporary-ignore';
    /**
     * Only ignore the issue if no upgrade or patch is available.
     */
    disregardIfFixable: boolean;
    /**
     * The timestamp that the issue will no longer be ignored.
     */
    expires?: string;
  }
  export interface IgnorePutBodyType {
    /**
     * The path to ignore (default is `*` which represents all paths).
     */
    ignorePath?: string;
    /**
     * The reason that the issue was ignored.
     */
    reason?: string;
    /**
     * The classification of the ignore.
     */
    reasonType?: 'not-vulnerable' | 'wont-fix' | 'temporary-ignore';
    /**
     * Only ignore the issue if no upgrade or patch is available.
     */
    disregardIfFixable: boolean;
    /**
     * The timestamp that the issue will no longer be ignored.
     */
    expires?: string;
  }
  export interface IgnoreGetResponseType {
    ''?: {
      /**
       * The reason that the issue was ignored.
       */
      reason?: string;
      /**
       * The classification of the ignore.
       */
      reasonType?: 'not-vulnerable' | 'wont-fix' | 'temporary-ignore';
      /**
       * The person who ignored the issue.
       */
      ignoredBy?: {
        /**
         * The name of the person who ignored the issue.
         */
        name: string;
        /**
         * The email of the person who ignored the issue.
         */
        email: string;
        /**
         * The user ID of the person who ignored the issue.
         */
        id?: string;
      };
      /**
       * Only ignore the issue if no upgrade or patch is available.
       */
      disregardIfFixable?: boolean;
      /**
       * The timestamp that the issue will no longer be ignored.
       */
      expires?: string;
      /**
       * The timestamp that the issue was ignored.
       */
      created?: string;
    };
  }
  export interface IgnorePostResponseType {
    ''?: {
      /**
       * The reason that the issue was ignored.
       */
      reason?: string;
      /**
       * The classification of the ignore.
       */
      reasonType?: 'not-vulnerable' | 'wont-fix' | 'temporary-ignore';
      /**
       * The person who ignored the issue.
       */
      ignoredBy?: {
        /**
         * The name of the person who ignored the issue.
         */
        name: string;
        /**
         * The email of the person who ignored the issue.
         */
        email: string;
        /**
         * The user ID of the person who ignored the issue.
         */
        id?: string;
      };
      /**
       * Only ignore the issue if no upgrade or patch is available.
       */
      disregardIfFixable?: boolean;
      /**
       * The timestamp that the issue will no longer be ignored.
       */
      expires?: string;
      /**
       * The timestamp that the issue was ignored.
       */
      created?: string;
    };
  }
  export interface IgnorePutResponseType {
    [key: string]: any;
  }
  export type IgnoreDeleteResponseType = any;
  export namespace Ignore {
    class Ignore {
      private currentContext;
      private issueId;
      constructor(
        parentContext: Object,
        Ignoreparam: ignoreClass,
        fullResponse?: boolean,
      );
      get(): Promise<IgnoreGetResponseType>;
      post(body: IgnorePostBodyType): Promise<IgnorePostResponseType>;
      put(body: IgnorePutBodyType): Promise<IgnorePutResponseType>;
      delete(): Promise<any>;
    }
  }
  export interface JiraissuesGetResponseType {
    ''?: string[];
  }
  export namespace Jiraissues {
    class Jiraissues {
      private currentContext;
      constructor(parentContext: Object, fullResponse?: boolean);
      get(): Promise<JiraissuesGetResponseType>;
    }
  }
  export interface SettingsPutBodyType {
    /**
     * If set to `true`, Snyk will raise dependency upgrade PRs automatically.
     */
    autoDepUpgradeEnabled?: boolean;
    /**
     * An array of comma-separated strings with names of dependencies you wish Snyk to ignore to upgrade.
     */
    autoDepUpgradeIgnoredDependencies?: string[];
    /**
     * The age (in days) that an automatic dependency check is valid for
     */
    autoDepUpgradeMinAge?: number;
    /**
     * The limit on auto dependency upgrade PRs.
     */
    autoDepUpgradeLimit?: number;
    /**
     * If set to `true`, fail Snyk Test if the repo has any vulnerabilities. Otherwise, fail only when the PR is adding a vulnerable dependency.
     */
    pullRequestFailOnAnyVulns?: boolean;
    /**
     * If set to `true`, fail Snyk Test only for high and critical severity vulnerabilities
     */
    pullRequestFailOnlyForHighSeverity?: boolean;
    /**
     * If set to `true`, Snyk Test checks PRs for vulnerabilities.:cq
     */
    pullRequestTestEnabled?: boolean;
    /**
     * assign Snyk pull requests
     */
    pullRequestAssignment?: {
      /**
       * if the organization's project(s) will assign Snyk pull requests.
       */
      enabled?: boolean;
      /**
       * a string representing the type of assignment your projects require.
       */
      type?: 'auto' | 'manual';
      /**
       * an array of usernames that have contributed to the organization's project(s).
       */
      assignees?: string[];
    };
    /**
     * Defines automatic remediation policies
     */
    autoRemediationPrs?: {
      /**
       * If true, allows automatic remediation of newly identified issues, or older issues where a fix has been identified
       */
      freshPrsEnabled?: boolean;
      /**
       * If true, allows automatic remediation of prioritized backlog issues
       */
      backlogPrsEnabled?: boolean;
      /**
       * Determine which issues are fixed in a backlog PR
       */
      backlogPrStrategy?: 'vuln' | 'dependency';
      /**
       * If true, allows using patched remediation
       */
      usePatchRemediation?: boolean;
    };
  }
  export interface SettingsGetResponseType {
    /**
     * If set to `true`, Snyk will raise dependency upgrade PRs automatically.
     */
    autoDepUpgradeEnabled?: boolean;
    /**
     * An array of comma-separated strings with names of dependencies you wish Snyk to ignore to upgrade.
     */
    autoDepUpgradeIgnoredDependencies?: {
      [key: string]: any;
    }[];
    /**
     * The age (in days) that an automatic dependency check is valid for
     */
    autoDepUpgradeMinAge?: number;
    /**
     * The limit on auto dependency upgrade PRs.
     */
    autoDepUpgradeLimit?: number;
    /**
     * If set to `true`, fail Snyk Test if the repo has any vulnerabilities. Otherwise, fail only when the PR is adding a vulnerable dependency.
     */
    pullRequestFailOnAnyVulns?: boolean;
    /**
     * If set to `true`, fail Snyk Test only for high and critical severity vulnerabilities
     */
    pullRequestFailOnlyForHighSeverity?: boolean;
    /**
     * If set to `true`, Snyk Test checks PRs for vulnerabilities.:cq
     */
    pullRequestTestEnabled?: boolean;
    /**
     * assign Snyk pull requests
     */
    pullRequestAssignment?: {
      /**
       * if the organization's project(s) will assign Snyk pull requests.
       */
      enabled?: boolean;
      /**
       * a string representing the type of assignment your projects require.
       */
      type?: 'auto' | 'manual';
      /**
       * an array of usernames that have contributed to the organization's project(s).
       */
      assignees?: {
        [key: string]: any;
      }[];
    };
    /**
     * Defines automatic remediation policies
     */
    autoRemediationPrs?: {
      /**
       * If true, allows automatic remediation of newly identified issues, or older issues where a fix has been identified
       */
      freshPrsEnabled?: boolean;
      /**
       * If true, allows automatic remediation of prioritized backlog issues
       */
      backlogPrsEnabled?: boolean;
      /**
       * Determine which issues are fixed in a backlog PR
       */
      backlogPrStrategy?: 'vuln' | 'dependency';
      /**
       * If true, allows using patched remediation
       */
      usePatchRemediation?: boolean;
    };
  }
  export interface SettingsPutResponseType {
    /**
     * If set to `true`, Snyk will raise dependency upgrade PRs automatically.
     */
    autoDepUpgradeEnabled?: boolean;
    /**
     * An array of comma-separated strings with names of dependencies you wish Snyk to ignore to upgrade.
     */
    autoDepUpgradeIgnoredDependencies?: {
      [key: string]: any;
    }[];
    /**
     * The age (in days) that an automatic dependency check is valid for
     */
    autoDepUpgradeMinAge?: number;
    /**
     * The limit on auto dependency upgrade PRs.
     */
    autoDepUpgradeLimit?: number;
    /**
     * If set to `true`, fail Snyk Test if the repo has any vulnerabilities. Otherwise, fail only when the PR is adding a vulnerable dependency.
     */
    pullRequestFailOnAnyVulns?: boolean;
    /**
     * If set to `true`, fail Snyk Test only for high and critical severity vulnerabilities
     */
    pullRequestFailOnlyForHighSeverity?: boolean;
    /**
     * If set to `true`, Snyk Test checks PRs for vulnerabilities.:cq
     */
    pullRequestTestEnabled?: boolean;
    /**
     * assign Snyk pull requests
     */
    pullRequestAssignment?: {
      /**
       * if the organization's project(s) will assign Snyk pull requests.
       */
      enabled?: boolean;
      /**
       * a string representing the type of assignment your projects require.
       */
      type?: 'auto' | 'manual';
      /**
       * an array of usernames that have contributed to the organization's project(s).
       */
      assignees?: {
        [key: string]: any;
      }[];
    };
    /**
     * Defines automatic remediation policies
     */
    autoRemediationPrs?: {
      /**
       * If true, allows automatic remediation of newly identified issues, or older issues where a fix has been identified
       */
      freshPrsEnabled?: boolean;
      /**
       * If true, allows automatic remediation of prioritized backlog issues
       */
      backlogPrsEnabled?: boolean;
      /**
       * Determine which issues are fixed in a backlog PR
       */
      backlogPrStrategy?: 'vuln' | 'dependency';
      /**
       * If true, allows using patched remediation
       */
      usePatchRemediation?: boolean;
    };
  }
  export interface SettingsDeleteResponseType {
    header: undefined;
  }
  export namespace Settings {
    class Settings {
      private currentContext;
      constructor(parentContext: Object, fullResponse?: boolean);
      get(): Promise<SettingsGetResponseType>;
      put(body: SettingsPutBodyType): Promise<SettingsPutResponseType>;
      delete(): Promise<SettingsDeleteResponseType>;
    }
  }
  export interface MovePutBodyType {
    /**
     * The ID of the organization that the project should be moved to. The API_KEY must have group admin permissions. If the project is moved to a new group, a personal level API key is needed.
     */
    targetOrgId?: string;
  }
  export interface MovePutResponseType {
    originOrg?: string;
    destinationOrg?: string;
    movedProject?: string;
  }
  export namespace Move {
    class Move {
      private currentContext;
      constructor(parentContext: Object, fullResponse?: boolean);
      put(body: MovePutBodyType): Promise<MovePutResponseType>;
    }
  }
  export interface TagsPostBodyType {
    /**
     * Alphanumeric including - and _ with a limit of 30 characters
     */
    key?: string;
    /**
     * Alphanumeric including - and _ with a limit of 50 characters
     */
    value?: string;
  }
  export interface TagsPostResponseType {
    /**
     * Tags now applied to the project
     */
    tags?: {
      [key: string]: any;
    }[];
  }
  export namespace Tags {
    class Tags {
      private currentContext;
      remove: Remove.Remove;
      constructor(parentContext: Object, fullResponse?: boolean);
      post(body: TagsPostBodyType): Promise<TagsPostResponseType>;
    }
    interface RemovePostBodyType {
      /**
       * Alphanumeric including - and _ with a limit of 30 characters
       */
      key?: string;
      /**
       * Alphanumeric including - and _ with a limit of 50 characters
       */
      value?: string;
    }
    interface RemovePostResponseType {
      /**
       * Tags now applied to the project
       */
      tags?: {
        [key: string]: any;
      }[];
    }
    namespace Remove {
      class Remove {
        private currentContext;
        constructor(parentContext: Object, fullResponse?: boolean);
        post(body: RemovePostBodyType): Promise<RemovePostResponseType>;
      }
    }
  }
  export interface AttributesPostBodyType {
    criticality?: string[];
    environment?: string[];
    lifecycle?: string[];
  }
  export interface AttributesPostResponseType {
    /**
     * Attributes now applied to the project
     */
    attributes?: {
      criticality?: {
        [key: string]: any;
      }[];
      environment?: {
        [key: string]: any;
      }[];
      lifecycle?: {
        [key: string]: any;
      }[];
    };
  }
  export namespace Attributes {
    class Attributes {
      private currentContext;
      constructor(parentContext: Object, fullResponse?: boolean);
      post(body: AttributesPostBodyType): Promise<AttributesPostResponseType>;
    }
  }
  export {};
}
export interface DependenciesPostBodyType {
  filters?: {
    /**
     * The type of languages to filter the results by
     */
    languages?: string[];
    /**
     * The list of project IDs to filter the results by
     */
    projects?: {
      [key: string]: any;
    };
    /**
     * The list of dependency IDs to filter the results by (i.e amdefine@1.0.1 or org.javassist:javassist@3.18.1-GA)
     */
    dependencies?: {
      [key: string]: any;
    };
    /**
     * The list of license IDs to filter the results by
     */
    licenses?: {
      [key: string]: any;
    };
    /**
     * The severities to filter the results by
     */
    severity?: string[];
    /**
     * Status of the dependency. Requires reporting entitlement. Options: `deprecated` - Include only deprecated packages; `notDeprecated` - Include all packages that are not marked as deprecated; `any` - Include all packages (default)
     */
    depStatus?: string;
  };
}
export interface DependenciesPostResponseType {
  /**
   * A list of issues
   */
  results: {
    /**
     * The identifier of the package
     */
    id: string;
    /**
     * The name of the package
     */
    name: string;
    /**
     * The version of the package
     */
    version: string;
    /**
     * The latest version available for the specified package
     */
    latestVersion?: string;
    /**
     * The timestamp for when the latest version of the specified package was published.
     */
    latestVersionPublishedDate?: string;
    /**
     * The timestamp for when the specified package was first published.
     */
    firstPublishedDate?: string;
    /**
     * True if the latest version of the package is marked as deprecated; False otherwise.
     */
    isDeprecated?: boolean;
    /**
     * The numbers for those versions that are marked as deprecated
     */
    deprecatedVersions?: string[];
    /**
     * The identifiers of dependencies with issues that are depended upon as a result of this dependency
     */
    dependenciesWithIssues?: string[];
    /**
     * The package type of the dependency
     */
    type: string;
    /**
     * The number of critical severity issues in this dependency
     */
    issuesCritical?: number;
    /**
     * The number of high severity issues in this dependency
     */
    issuesHigh?: number;
    /**
     * The number of medium severity issues in this dependency
     */
    issuesMedium?: number;
    /**
     * The number of low severity issues in this dependency
     */
    issuesLow?: number;
    /**
     * The licenses of the dependency
     */
    licenses: {
      /**
       * The identifier of the license
       */
      id: string;
      /**
       * The title of the license
       */
      title: string;
      /**
       * The type of the license
       */
      license: string;
    }[];
    /**
     * The projects which depend on the dependency
     */
    projects: {
      /**
       * The identifier of the project
       */
      id: string;
      /**
       * The name of the project
       */
      name: string;
    }[];
    /**
     * The copyright notices for the package
     */
    copyright?: string[];
  }[];
  /**
   * The number of results returned
   */
  total?: number;
}
export declare namespace Dependencies {
  class Dependencies {
    private currentContext;
    constructor(parentContext: Object, fullResponse?: boolean);
    post(
      body: DependenciesPostBodyType,
      sortBy?: string,
      order?: string,
      page?: number,
      perPage?: number,
    ): Promise<DependenciesPostResponseType>;
    postAll(
      body: DependenciesPostBodyType,
      sortBy?: string,
      order?: string,
      noLimitMode?: boolean,
    ): Promise<DependenciesPostResponseType[]>;
  }
}
export interface LicensesPostBodyType {
  filters?: {
    /**
     * The type of languages to filter the results by
     */
    languages?: string[];
    /**
     * The list of project IDs to filter the results by
     */
    projects?: {
      [key: string]: any;
    };
    /**
     * The list of dependency IDs to filter the results by
     */
    dependencies?: {
      [key: string]: any;
    };
    /**
     * The list of license IDs to filter the results by
     */
    licenses?: {
      [key: string]: any;
    };
    /**
     * The severities to filter the results by
     */
    severity?: string[];
  };
}
export interface LicensesPostResponseType {
  /**
   * A list of licenses
   */
  results: {
    /**
     * The identifier of the license
     */
    id: string;
    /**
     * The severity assigned to this license
     */
    severity?: 'none' | 'high' | 'medium' | 'low';
    /**
     * Custom instructions assigned to this license
     */
    instructions?: string;
    /**
     * The dependencies of projects in the organization which have the license
     */
    dependencies: {
      /**
       * The identifier of the package
       */
      id: string;
      /**
       * The name of the package
       */
      name: string;
      /**
       * The version of the package
       */
      version: string;
      /**
       * The package manager of the dependency
       */
      packageManager: string;
    }[];
    /**
     * The projects which contain the license
     */
    projects: {
      /**
       * The identifier of the project
       */
      id: string;
      /**
       * The name of the project
       */
      name: string;
    }[];
  }[];
  /**
   * The number of results returned
   */
  total?: number;
}
export declare namespace Licenses {
  class Licenses {
    private currentContext;
    constructor(parentContext: Object, fullResponse?: boolean);
    post(
      body: LicensesPostBodyType,
      sortBy?: string,
      order?: string,
    ): Promise<LicensesPostResponseType>;
  }
}
export interface EntitlementsGetResponseType {
  licenses?: boolean;
  reports?: boolean;
  fullVulnDB?: boolean;
}
export declare namespace Entitlements {
  class Entitlements {
    private currentContext;
    constructor(parentContext: Object, fullResponse?: boolean);
    get(): Promise<EntitlementsGetResponseType>;
  }
}
interface entitlementClass {
  entitlementKey: string;
}
export declare namespace Entitlement {
  class Entitlement {
    private currentContext;
    private entitlementKey;
    constructor(
      parentContext: Object,
      Entitlementparam: entitlementClass,
      fullResponse?: boolean,
    );
    get(): Promise<boolean>;
  }
}
export interface AuditPostBodyType {
  filters?: {
    /**
     * User public ID. Will fetch only audit logs originated from this user's actions.
     */
    userId?: string;
    /**
     * User email address. Will fetch only audit logs originated from this user's actions. Ignored if the userId filter is set.
     */
    email?: string;
    /**
     * Will return only logs for this specific event. Only one of event and excludeEvent may be specified in a request.
     */
    event?:
      | 'api.access'
      | 'org.app_bot.create'
      | 'org.app.create'
      | 'org.app.delete'
      | 'org.app.edit'
      | 'org.cloud_config.settings.edit'
      | 'org.collection.create'
      | 'org.collection.delete'
      | 'org.collection.edit'
      | 'org.create'
      | 'org.delete'
      | 'org.edit'
      | 'org.ignore_policy.edit'
      | 'org.integration.create'
      | 'org.integration.delete'
      | 'org.integration.edit'
      | 'org.integration.settings.edit'
      | 'org.language_settings.edit'
      | 'org.notification_settings.edit'
      | 'org.org_source.create'
      | 'org.org_source.delete'
      | 'org.org_source.edit'
      | 'org.policy.edit'
      | 'org.project_filter.create'
      | 'org.project_filter.delete'
      | 'org.project.add'
      | 'org.project.attributes.edit'
      | 'org.project.delete'
      | 'org.project.edit'
      | 'org.project.fix_pr.auto_open'
      | 'org.project.fix_pr.manual_open'
      | 'org.project.ignore.create'
      | 'org.project.ignore.delete'
      | 'org.project.ignore.edit'
      | 'org.project.monitor'
      | 'org.project.pr_check.edit'
      | 'org.project.remove'
      | 'org.project.settings.delete'
      | 'org.project.settings.edit'
      | 'org.project.stop_monitor'
      | 'org.project.tag.add'
      | 'org.project.tag.remove'
      | 'org.project.test'
      | 'org.request_access_settings.edit'
      | 'org.sast_settings.edit'
      | 'org.service_account.create'
      | 'org.service_account.delete'
      | 'org.service_account.edit'
      | 'org.settings.feature_flag.edit'
      | 'org.target.create'
      | 'org.target.delete'
      | 'org.user.add'
      | 'org.user.invite'
      | 'org.user.invite.accept'
      | 'org.user.invite.revoke'
      | 'org.user.invite_link.accept'
      | 'org.user.invite_link.create'
      | 'org.user.invite_link.revoke'
      | 'org.user.leave'
      | 'org.user.provision.accept'
      | 'org.user.provision.create'
      | 'org.user.provision.delete'
      | 'org.user.remove'
      | 'org.user.role.create'
      | 'org.user.role.delete'
      | 'org.user.role.details.edit'
      | 'org.user.role.edit'
      | 'org.user.role.permissions.edit'
      | 'org.webhook.add'
      | 'org.webhook.delete'
      | 'user.org.notification_settings.edit';
    /**
     * Will return logs except logs for this event. Only one of event and excludeEvent may be specified in a request.
     */
    excludeEvent?:
      | 'api.access'
      | 'org.app_bot.create'
      | 'org.app.create'
      | 'org.app.delete'
      | 'org.app.edit'
      | 'org.cloud_config.settings.edit'
      | 'org.collection.create'
      | 'org.collection.delete'
      | 'org.collection.edit'
      | 'org.create'
      | 'org.delete'
      | 'org.edit'
      | 'org.ignore_policy.edit'
      | 'org.integration.create'
      | 'org.integration.delete'
      | 'org.integration.edit'
      | 'org.integration.settings.edit'
      | 'org.language_settings.edit'
      | 'org.notification_settings.edit'
      | 'org.org_source.create'
      | 'org.org_source.delete'
      | 'org.org_source.edit'
      | 'org.policy.edit'
      | 'org.project_filter.create'
      | 'org.project_filter.delete'
      | 'org.project.add'
      | 'org.project.attributes.edit'
      | 'org.project.delete'
      | 'org.project.edit'
      | 'org.project.fix_pr.auto_open'
      | 'org.project.fix_pr.manual_open'
      | 'org.project.ignore.create'
      | 'org.project.ignore.delete'
      | 'org.project.ignore.edit'
      | 'org.project.monitor'
      | 'org.project.pr_check.edit'
      | 'org.project.remove'
      | 'org.project.settings.delete'
      | 'org.project.settings.edit'
      | 'org.project.stop_monitor'
      | 'org.project.tag.add'
      | 'org.project.tag.remove'
      | 'org.project.test'
      | 'org.request_access_settings.edit'
      | 'org.sast_settings.edit'
      | 'org.service_account.create'
      | 'org.service_account.delete'
      | 'org.service_account.edit'
      | 'org.settings.feature_flag.edit'
      | 'org.target.create'
      | 'org.target.delete'
      | 'org.user.add'
      | 'org.user.invite'
      | 'org.user.invite.accept'
      | 'org.user.invite.revoke'
      | 'org.user.invite_link.accept'
      | 'org.user.invite_link.create'
      | 'org.user.invite_link.revoke'
      | 'org.user.leave'
      | 'org.user.provision.accept'
      | 'org.user.provision.create'
      | 'org.user.provision.delete'
      | 'org.user.remove'
      | 'org.user.role.create'
      | 'org.user.role.delete'
      | 'org.user.role.details.edit'
      | 'org.user.role.edit'
      | 'org.user.role.permissions.edit'
      | 'org.webhook.add'
      | 'org.webhook.delete'
      | 'user.org.notification_settings.edit';
    /**
     * Will return only logs for this specific project.
     */
    projectId?: string;
  };
}
export declare type AuditPostResponseType = any;
export declare namespace Audit {
  class Audit {
    private currentContext;
    constructor(parentContext: Object, fullResponse?: boolean);
    post(
      body: AuditPostBodyType,
      from?: string,
      to?: string,
      page?: number,
      sortOrder?: string,
    ): Promise<any>;
    postAll(
      body: AuditPostBodyType,
      from?: string,
      to?: string,
      sortOrder?: string,
      noLimitMode?: boolean,
    ): Promise<any>;
  }
}
interface webhooksClass {
  webhookId: string;
}
export interface WebhooksPostBodyType {
  /**
   * Webhooks can only be configured for URLs using the `https` protocol. `http` is not allowed.
   */
  url?: string;
  /**
   * This is a password you create, that Snyk uses to sign our transports to you, so you be sure the notification is authentic. Your `secret` should: Be a random string with high entropy; Not be used for anything else; Only known to Snyk and your webhook transport consuming code;
   */
  secret?: string;
}
export declare type WebhooksPostResponseType = any;
export declare type WebhooksGetResponseType = any;
export declare type WebhooksDeleteResponseType = any;
export declare namespace Webhooks {
  class Webhooks {
    private currentContext;
    private webhookId;
    ping: Ping.Ping;
    constructor(
      parentContext: Object,
      Webhooksparam: webhooksClass,
      fullResponse?: boolean,
    );
    post(body: WebhooksPostBodyType): Promise<any>;
    get(): Promise<any>;
    delete(): Promise<any>;
  }
  type PingPostResponseType = any;
  namespace Ping {
    class Ping {
      private currentContext;
      constructor(parentContext: Object, fullResponse?: boolean);
      post(): Promise<any>;
    }
  }
}
export {};
