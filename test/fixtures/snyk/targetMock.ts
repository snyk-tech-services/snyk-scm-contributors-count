import { TargetType } from '../../../src/lib/snyk';

export const listAllTargetCliOnly: { data: TargetType[] } = {
  data: [
    {
      type: 'target',
      id: 'ef5397fc-a8c0-4ee3-b7c8-e05902a982d6',
      attributes: {
        isPrivate: true,
        origin: 'cli',
        displayName: 'test-snyk',
        remoteUrl: 'https://not-a-real-url',
      },
    },
    {
      type: 'target',
      id: '4065a016-997d-4719-a31f-50d882737dd3',
      attributes: {
        isPrivate: true,
        origin: 'cli',
        displayName: 'test-snyk-2',
        remoteUrl: 'https://not-a-real-url',
      },
    },
  ],
};

export const listAllTargetsScmOnly = {
  data: [
    {
      type: 'target',
      id: 'ef5397fc-a8c0-4ee3-b7c8-e05902a982d6',
      attributes: {
        isPrivate: true,
        origin: 'bitbucket-server',
        displayName: 'test-snyk',
        remoteUrl: null,
      },
    },
    {
      type: 'target',
      id: '4065a016-997d-4719-a31f-50d882737dd3',
      attributes: {
        isPrivate: true,
        origin: 'bitbucket-server',
        displayName: 'test-snyk-2',
        remoteUrl: null,
      },
    },
    {
      type: 'target',
      id: '49349720-6ae0-439b-9984-564d4e924f85',
      attributes: {
        isPrivate: true,
        origin: 'bitbucket-server',
        displayName: 'test-snyk-3',
        remoteUrl: null,
      },
    },
  ],
};
