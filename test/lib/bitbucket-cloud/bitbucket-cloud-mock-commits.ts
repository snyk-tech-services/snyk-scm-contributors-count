export const mockCommit1 = {
  date: 1638367972068,
  author: {
    name: 'mockName1',
    user: {
      uuid: '00000000-0000-0000-0000-000000000001',
      display_name: 'mockDisplayName1',
      type: 'user',
      nickname: 'mockNickname1',
    },
    raw: 'mockDisplayName1 <mockEmail1@example.com>',
    emailAddress: '<mockEmail1@example.com>',
    displayName: 'mockDisplayName1',
  },
};

// Same as mockCommit1 except for the email-address.
export const mockCommit2 = {
  ...mockCommit1,
  author: {
    ...mockCommit1.author,
    raw: 'mockDisplayName1 <mockEmail1-2@example.com>',
    emailAddress: '<mockEmail1-2@example.com>',
  },
};

export const mockCommit3 = {
  date: 1638367972070,
  author: {
    name: 'mockName3',
    user: {
      uuid: '00000000-0000-0000-0000-000000000003',
      display_name: 'mockDisplayName3',
      type: 'user',
      nickname: 'mockNickname3',
    },
    raw: 'mockDisplayName3 <mockEmail3@example.com>',
    emailAddress: '<mockEmail3@example.com>',
    displayName: 'mockDisplayName3',
  },
};

// Same as mockCommit3 except for the UUID and email-address.
export const mockCommit4 = {
  ...mockCommit3,
  author: {
    ...mockCommit3.author,
    user: {
      ...mockCommit3.author.user,
      uuid: '00000000-0000-0000-0000-000000000004',
    },
  },
};

export default {
  mockCommit1,
  mockCommit2,
  mockCommit3,
  mockCommit4,
};
