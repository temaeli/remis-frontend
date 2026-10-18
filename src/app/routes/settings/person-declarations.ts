import { gql } from '@apollo/client/core';

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ContentParameter } from '@shared/components/view-component/view-interface';

/**
 * The declarations a person has accepted (`bio_data_declarations`), for their
 * page in Settings. Read only, with no buttons: accepting is the person's own
 * act.
 */

const DECLARATIONS_ACCEPTED_BY_PERSON = gql`
  query declarationsAcceptedByBioData($bioDataUid: String) {
    declarationsAcceptedByBioData(bioDataUid: $bioDataUid) {
      uid
      name
      description
      subcategoryName
      acceptedAt
    }
  }
`;

/** What they have declared and when, newest first. */
export const personDeclarationsPanel = (
  _comp: BaseComponent,
  bioDataUid?: string,
): ContentParameter => ({
  type: 'table',
  name: 'Declarations',
  label: 'Declarations',
  icon: 'verified',
  permissions: ['ROLE_VIEW_ALL_BIO_DATA', 'ROLE_VIEW_BIO_DATA'],
  keyColumns: [
    'index',
    'name as Declaration',
    'description as Wording',
    'subcategoryName as Subcategory',
    { field: 'acceptedAt', header: 'Accepted' },
  ],
  fetchParameter: {
    query: DECLARATIONS_ACCEPTED_BY_PERSON,
    variables: { bioDataUid },
  },
});
