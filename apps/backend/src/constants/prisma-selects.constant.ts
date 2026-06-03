export const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  loginCount: true,
  lastLoginAt: true,

  profile: {
    select: {
      profileType: true,
      profileValue: true,
      coverType: true,
      coverValue: true,
    },
  },

  settings: {
    select: {
      darkMode: true,
    },
  },

  accounts: {
    select: {
      provider: true,
      providerAccountId: true,
    },
  },
} as const;
