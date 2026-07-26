// Shared select-field option helpers for the Security module.
// Stations and Users reuse existing pageable lookups; security reference
// entities reuse their own `all*` providers.

import { lookupOptions } from '@shared/crud';
import { GET_ALL_PIPELINE_STATIONS } from 'app/routes/pipeline-management/pipeline-stations/pipeline-station.graphql';
import { GET_ALL_USERS_PAGEABLE } from 'app/routes/plants/plants/plant.graphql';
import { ALL_SECURITY_INCIDENT_TYPES } from '../security-incident-types/security-incident-type.graphql';
import { ALL_SECURITY_CONTRACTORS } from '../security-contractors/security-contractor.graphql';
import { ALL_SECURITY_GUARDS_PAGEABLE } from '../security-guards/security-guard.graphql';
import { ALL_SECURITY_INCIDENTS_PAGEABLE } from '../security-incidents/security-incident.graphql';
import { ALL_SECURITY_FORMS } from '../security-forms/security-form.graphql';

const PAGE = { active: true, pageableParam: { size: 1000 } };

/** Pipeline station picker — value = station `uid`. */
export const stationOptions = () =>
  lookupOptions({
    query: GET_ALL_PIPELINE_STATIONS,
    labelKey: 'name',
    valueKey: 'uid',
    variables: PAGE,
  });

/** User picker — value = user `uid`. */
export const userOptions = () =>
  lookupOptions({
    query: GET_ALL_USERS_PAGEABLE,
    labelKey: 'fullName',
    valueKey: 'uid',
    variables: PAGE,
  });

/** Security incident type picker — value = `uid`. */
export const incidentTypeOptions = () =>
  lookupOptions({
    query: ALL_SECURITY_INCIDENT_TYPES,
    labelKey: 'name',
    valueKey: 'uid',
  });

/** Security contractor picker — value = `uid`. */
export const contractorOptions = () =>
  lookupOptions({
    query: ALL_SECURITY_CONTRACTORS,
    labelKey: 'name',
    valueKey: 'uid',
  });

/** Security guard picker — value = `uid`, label = `fullName`. */
export const guardOptions = () =>
  lookupOptions({
    query: ALL_SECURITY_GUARDS_PAGEABLE,
    labelKey: 'fullName',
    valueKey: 'uid',
    variables: PAGE,
  });

/** Security incident picker — value = `uid`, label = `referenceNumber`. */
export const incidentOptions = () =>
  lookupOptions({
    query: ALL_SECURITY_INCIDENTS_PAGEABLE,
    labelKey: 'referenceNumber',
    valueKey: 'uid',
    variables: PAGE,
  });

/** Security form definition picker — value = `uid`, label = `name`. */
export const formOptions = () =>
  lookupOptions({
    query: ALL_SECURITY_FORMS,
    labelKey: 'name',
    valueKey: 'uid',
  });
