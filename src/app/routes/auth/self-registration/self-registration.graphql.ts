import gql from 'graphql-tag';

/**
 * Get all customer categories (for self-registration)
 * Used to populate the category selector
 */
export const ALL_CUSTOMER_CATEGORIES_PUBLIC = gql`
  query AllCustomerCategories {
    allCustomerCategories {
      uid
      name
    }
  }
`;

/**
 * Get all regions (for location cascade)
 */
export const GET_ALL_REGIONS_PUBLIC = gql`
  query GetAllRegions {
    getAllRegions {
      uid
      name
    }
  }
`;

/**
 * Get districts by region
 */
export const GET_DISTRICTS_BY_REGION_PUBLIC = gql`
  query GetDistrictsByRegion($regionUid: String!) {
    getDistrictsByRegion(regionUid: $regionUid) {
      uid
      name
    }
  }
`;

/**
 * Get wards by district
 */
export const GET_WARDS_BY_DISTRICT_PUBLIC = gql`
  query GetWardsByDistrict($districtUid: String!) {
    getWardsByDistrict(districtUid: $districtUid) {
      uid
      name
    }
  }
`;

/**
 * Get sub-wards by ward
 */
export const GET_SUB_WARDS_BY_WARD_PUBLIC = gql`
  query GetSubWardsByWard($wardUid: String!) {
    getSubWardsByWard(wardUid: $wardUid) {
      uid
      name
    }
  }
`;

/**
 * Get all active sub-wards (fallback for direct search)
 */
export const GET_ALL_ACTIVE_SUB_WARDS_PUBLIC = gql`
  query GetAllActiveSubWards {
    getAllActiveSubWards {
      uid
      name
      ward {
        uid
        name
        district {
          uid
          name
          region {
            uid
            name
          }
        }
      }
    }
  }
`;

/**
 * Get my client status (authenticated)
 * Called after password setup to track registration status
 */
export const GET_MY_CLIENT_STATUS = gql`
  query GetMyClientStatus {
    myClientStatus {
      applicationReference
      approvalStatus
      customerId
      approvalComments
      statusMessage
    }
  }
`;
