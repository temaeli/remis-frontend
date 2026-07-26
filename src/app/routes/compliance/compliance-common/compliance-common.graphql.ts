import { userMinimalGqlFields } from '@routes/users-managment/users/user.graphql';
import { baseGqlFields } from '@shared/fetch/graphql.constants';

export const complianceStageGqlFields = `
  comment
  createdAt
  createdBy{ ${userMinimalGqlFields}}
  current
  description
  sentBy{ ${userMinimalGqlFields}}
  stage
   ${baseGqlFields}

`;
