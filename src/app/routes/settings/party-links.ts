import { gql } from '@apollo/client/core';

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { FieldType } from '@shared/components/generic-form/field.interface';
import { VALIDATOR_REQUIRED } from '@shared/components/generic-form/form-constants';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { entityLinkPanels, EntityLinkField } from '@shared/lookup';

/**
 * Who a certificate or an agreement names, and as what.
 *
 * Four join tables carry a `parties` column — `certificates_bio_data`,
 * `certificates_business_names`, `agreements_bio_data` and
 * `agreements_business_names` — so the link form asks for a party beside the
 * person or the organisation, and the grid shows it. Linking someone who is
 * already there under another party changes their party.
 *
 * One organisation under another (`business_names_business_names`) is here too:
 * it came with the same change and is read on the same page. A person's party
 * to an organisation (`bio_data_business_names`) is in `person-links`, which
 * takes the list and the column from here.
 *
 * Declared apart from the registries the records live in, which import one
 * another: the reads these panels need are declared here instead.
 */

/** The labels of the database enum `parties`, mirroring `Party` on the backend. */
export const PARTY_OPTIONS = [
  { value: 'ISSUER', label: 'Issuer' },
  { value: 'HOLDER', label: 'Holder' },
  { value: 'APPLICANT', label: 'Applicant' },
  { value: 'SIGNATORY', label: 'Signatory' },
  { value: 'VERIFIER', label: 'Verifier' },
  { value: 'WITNESS', label: 'Witness' },
  { value: 'APPROVER', label: 'Approver' },
  { value: 'PAYER', label: 'Payer' },
  { value: 'PAYEE', label: 'Payee' },
  { value: 'PRODUCER', label: 'Producer' },
  { value: 'CONSUMER', label: 'Consumer' },
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'SUPPLIER', label: 'Supplier' },
  { value: 'REPRESENTATIVE', label: 'Representative' },
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'EMPLOYER', label: 'Employer' },
  { value: 'ACCOUNTING_OFFICER', label: 'Accounting Officer' },
];

const partyLabel = (party?: string): string =>
  PARTY_OPTIONS.find((option) => option.value === party)?.label ?? party ?? '';

/** The party on a link: an argument to the mutation, a select and a column. */
export const partyField = (): EntityLinkField => ({
  arg: 'party',
  rowField: 'party',
  // An enum argument, so the variable cannot be declared as a String.
  gqlType: 'Party',
  field: {
    label: 'Party',
    hint: 'What they are to it',
    type: FieldType.select,
    options: PARTY_OPTIONS,
    validations: [VALIDATOR_REQUIRED],
    class: 'col-span-full',
  },
});

/** For a link whose `columns` are spelled out, which then has to name the party itself. */
export const partyColumn = {
  field: 'party',
  header: 'Party',
  valueFn: (row: { party?: string }) => partyLabel(row?.party),
};

const ALL_PEOPLE = gql`
  query allBioData {
    allBioData {
      id
      name
    }
  }
`;

const ALL_BUSINESS_NAMES = gql`
  query allBusinessNames {
    allBusinessNames {
      id
      name
    }
  }
`;

const ALL_CERTIFICATES = gql`
  query allCertificates {
    allCertificates {
      id
      name
    }
  }
`;

/** `bio_data` is not a `CoreNamedEntity`: it has a name and no assigned number. */
const personGqlFields = `
  id
  name
`;

/** The people and the organisations a certificate names, on the certificate's page. */
export const certificatePartyPanels = (
  comp: BaseComponent,
  certificateUid?: string,
): ContentParameter[] =>
  entityLinkPanels(
    comp,
    [
      {
        entity: 'CertificateBioData',
        byOwnerQuery: 'certificateBioDataByCertificate',
        ownerArg: 'certificateUid',
        targetArg: 'bioDataUid',
        field: 'bioData',
        label: 'Person',
        pluralLabel: 'People',
        icon: 'user',
        permission: 'CERTIFICATE_BIO_DATA',
        optionsQuery: ALL_PEOPLE,
        targetGqlFields: personGqlFields,
        columns: ['index', 'bioData.name as Name', partyColumn, 'actions'],
        extraFields: [partyField()],
      },
      {
        entity: 'CertificateBusinessName',
        byOwnerQuery: 'certificateBusinessNamesByCertificate',
        ownerArg: 'certificateUid',
        targetArg: 'businessNameUid',
        field: 'businessName',
        label: 'Organisation',
        pluralLabel: 'Organisations',
        icon: 'institution',
        permission: 'CERTIFICATE_BUSINESS_NAME',
        optionsQuery: ALL_BUSINESS_NAMES,
        columns: [
          'index',
          'businessName.assignedNumber as Assigned Number',
          'businessName.name as Name',
          partyColumn,
          'actions',
        ],
        extraFields: [partyField()],
      },
    ],
    certificateUid,
  );

/** The certificates a person is named on, on the person's page. */
export const personCertificatesPanels = (
  comp: BaseComponent,
  personUid?: string,
): ContentParameter[] =>
  entityLinkPanels(
    comp,
    [
      {
        entity: 'CertificateBioData',
        byOwnerQuery: 'certificateBioDataByBioData',
        ownerArg: 'bioDataUid',
        targetArg: 'certificateUid',
        field: 'certificate',
        label: 'Certificate',
        pluralLabel: 'Certificates',
        icon: 'verified_user',
        permission: 'CERTIFICATE_BIO_DATA',
        optionsQuery: ALL_CERTIFICATES,
        columns: [
          'index',
          'certificate.assignedNumber as Assigned Number',
          'certificate.name as Name',
          partyColumn,
          'actions',
        ],
        extraFields: [partyField()],
      },
    ],
    personUid,
  );

/**
 * On an organisation's page: the certificates it is named on, the
 * organisations under it and those it sits under. Deleting it is refused while
 * any of the three has anything in it.
 */
export const businessNamePartyPanels = (
  comp: BaseComponent,
  businessNameUid?: string,
): ContentParameter[] =>
  entityLinkPanels(
    comp,
    [
      {
        entity: 'CertificateBusinessName',
        byOwnerQuery: 'certificateBusinessNamesByBusinessName',
        ownerArg: 'businessNameUid',
        targetArg: 'certificateUid',
        field: 'certificate',
        label: 'Certificate',
        pluralLabel: 'Certificates',
        icon: 'verified_user',
        permission: 'CERTIFICATE_BUSINESS_NAME',
        optionsQuery: ALL_CERTIFICATES,
        columns: [
          'index',
          'certificate.assignedNumber as Assigned Number',
          'certificate.name as Name',
          partyColumn,
          'actions',
        ],
        extraFields: [partyField()],
      },
      {
        entity: 'BusinessNameBusinessName',
        byOwnerQuery: 'businessNameBusinessNamesByParent',
        ownerArg: 'parentUid',
        targetArg: 'childUid',
        field: 'child',
        label: 'Organisation',
        pluralLabel: 'Organisations Under This One',
        icon: 'institution',
        permission: 'BUSINESS_NAME_BUSINESS_NAME',
        optionsQuery: ALL_BUSINESS_NAMES,
      },
      {
        entity: 'BusinessNameBusinessName',
        byOwnerQuery: 'businessNameBusinessNamesByChild',
        ownerArg: 'childUid',
        targetArg: 'parentUid',
        field: 'parent',
        label: 'Organisation',
        pluralLabel: 'Sits Under',
        icon: 'institution',
        permission: 'BUSINESS_NAME_BUSINESS_NAME',
        optionsQuery: ALL_BUSINESS_NAMES,
      },
    ],
    businessNameUid,
  );
