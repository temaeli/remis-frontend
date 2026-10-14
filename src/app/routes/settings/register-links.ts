import { gql } from '@apollo/client/core';

import { BaseComponent } from '@shared/components/base-componet/base-component';
import { ContentParameter } from '@shared/components/view-component/view-interface';
import { entityLinkPanels, EntityLinkConfig } from '@shared/lookup';

/**
 * Who is an applicant or a consumer, which collection centres a person is at,
 * and which subcategories an organisation is under — five two-column join
 * tables, each with its own link/unlink pair:
 *
 * - `bio_data_collection_centers`
 * - `bio_data_applicants`
 * - `bio_data_consumers`
 * - `business_names_consumers`
 * - `business_names_subcategories`
 *
 * Each is read from both of its sides, so the panels here hang off a person, an
 * organisation, an applicant, a consumer, a collection centre and a
 * subcategory.
 *
 * Declared apart from the registries the records live in, which import one
 * another: the reads these panels need are declared here instead.
 */

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

const ALL_COLLECTION_CENTERS = gql`
  query allCollectionCenters {
    allCollectionCenters {
      id
      name
    }
  }
`;

const ALL_SUBCATEGORIES = gql`
  query allSubcategories {
    allSubcategories {
      id
      name
    }
  }
`;

const ALL_APPLICANTS = gql`
  query allApplicants {
    allApplicants {
      id
      name
    }
  }
`;

const ALL_CONSUMERS = gql`
  query allConsumers {
    allConsumers {
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

/** A person as the far side of a link, read from the record they are linked to. */
const personSide = (
  entity: string,
  byOwnerQuery: string,
  ownerArg: string,
  permission: string,
): EntityLinkConfig => ({
  entity,
  byOwnerQuery,
  ownerArg,
  targetArg: 'bioDataUid',
  field: 'bioData',
  label: 'Person',
  pluralLabel: 'People',
  icon: 'user',
  permission,
  optionsQuery: ALL_PEOPLE,
  targetGqlFields: personGqlFields,
  columns: ['index', 'bioData.name as Name', 'actions'],
});

/** On a person's page: their collection centres, and the applicants and consumers they are. */
export const personRegisterPanels = (comp: BaseComponent, personUid?: string): ContentParameter[] =>
  entityLinkPanels(
    comp,
    [
      {
        entity: 'BioDataCollectionCenter',
        byOwnerQuery: 'bioDataCollectionCentersByBioData',
        ownerArg: 'bioDataUid',
        targetArg: 'collectionCenterUid',
        field: 'collectionCenter',
        label: 'Collection Center',
        pluralLabel: 'Collection Centers',
        icon: 'location',
        permission: 'BIO_DATA_COLLECTION_CENTER',
        optionsQuery: ALL_COLLECTION_CENTERS,
      },
      {
        entity: 'BioDataApplicant',
        byOwnerQuery: 'bioDataApplicantsByBioData',
        ownerArg: 'bioDataUid',
        targetArg: 'applicantUid',
        field: 'applicant',
        label: 'Applicant',
        pluralLabel: 'Applicants',
        icon: 'users',
        permission: 'BIO_DATA_APPLICANT',
        optionsQuery: ALL_APPLICANTS,
      },
      {
        entity: 'BioDataConsumer',
        byOwnerQuery: 'bioDataConsumersByBioData',
        ownerArg: 'bioDataUid',
        targetArg: 'consumerUid',
        field: 'consumer',
        label: 'Consumer',
        pluralLabel: 'Consumers',
        icon: 'users',
        permission: 'BIO_DATA_CONSUMER',
        optionsQuery: ALL_CONSUMERS,
      },
    ],
    personUid,
  );

/** On an organisation's page: the consumers it is, and the subcategories it is under. */
export const businessNameRegisterPanels = (
  comp: BaseComponent,
  businessNameUid?: string,
): ContentParameter[] =>
  entityLinkPanels(
    comp,
    [
      {
        entity: 'BusinessNameConsumer',
        byOwnerQuery: 'businessNameConsumersByBusinessName',
        ownerArg: 'businessNameUid',
        targetArg: 'consumerUid',
        field: 'consumer',
        label: 'Consumer',
        pluralLabel: 'Consumers',
        icon: 'users',
        permission: 'BUSINESS_NAME_CONSUMER',
        optionsQuery: ALL_CONSUMERS,
      },
      {
        entity: 'BusinessNameSubcategory',
        byOwnerQuery: 'businessNameSubcategoriesByBusinessName',
        ownerArg: 'businessNameUid',
        targetArg: 'subcategoryUid',
        field: 'subcategory',
        label: 'Subcategory',
        pluralLabel: 'Subcategories',
        icon: 'price_tag',
        permission: 'BUSINESS_NAME_SUBCATEGORY',
        optionsQuery: ALL_SUBCATEGORIES,
      },
    ],
    businessNameUid,
  );

/** On an applicant's page: the people who are one. */
export const applicantPeoplePanels = (comp: BaseComponent, applicantUid?: string): ContentParameter[] =>
  entityLinkPanels(
    comp,
    [personSide('BioDataApplicant', 'bioDataApplicantsByApplicant', 'applicantUid', 'BIO_DATA_APPLICANT')],
    applicantUid,
  );

/** On a consumer's page: the people and the organisations that are one. */
export const consumerPartyPanels = (comp: BaseComponent, consumerUid?: string): ContentParameter[] =>
  entityLinkPanels(
    comp,
    [
      personSide('BioDataConsumer', 'bioDataConsumersByConsumer', 'consumerUid', 'BIO_DATA_CONSUMER'),
      {
        entity: 'BusinessNameConsumer',
        byOwnerQuery: 'businessNameConsumersByConsumer',
        ownerArg: 'consumerUid',
        targetArg: 'businessNameUid',
        field: 'businessName',
        label: 'Organisation',
        pluralLabel: 'Organisations',
        icon: 'institution',
        permission: 'BUSINESS_NAME_CONSUMER',
        optionsQuery: ALL_BUSINESS_NAMES,
      },
    ],
    consumerUid,
  );

/** On a collection centre's page: the people at it. */
export const collectionCenterPeoplePanels = (
  comp: BaseComponent,
  collectionCenterUid?: string,
): ContentParameter[] =>
  entityLinkPanels(
    comp,
    [
      personSide(
        'BioDataCollectionCenter',
        'bioDataCollectionCentersByCollectionCenter',
        'collectionCenterUid',
        'BIO_DATA_COLLECTION_CENTER',
      ),
    ],
    collectionCenterUid,
  );

/** On a subcategory's page: the organisations under it. */
export const subcategoryOrganisationsPanels = (
  comp: BaseComponent,
  subcategoryUid?: string,
): ContentParameter[] =>
  entityLinkPanels(
    comp,
    [
      {
        entity: 'BusinessNameSubcategory',
        byOwnerQuery: 'businessNameSubcategoriesBySubcategory',
        ownerArg: 'subcategoryUid',
        targetArg: 'businessNameUid',
        field: 'businessName',
        label: 'Organisation',
        pluralLabel: 'Organisations',
        icon: 'institution',
        permission: 'BUSINESS_NAME_SUBCATEGORY',
        optionsQuery: ALL_BUSINESS_NAMES,
      },
    ],
    subcategoryUid,
  );
