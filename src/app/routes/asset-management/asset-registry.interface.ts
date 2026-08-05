/** Lifecycle status of an asset — mirrors `AssetStatus` on the backend. */
export enum AssetStatus {
  DRAFT = 'DRAFT',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  VERIFIED = 'VERIFIED',
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  ALLOCATED = 'ALLOCATED',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  DISPUTED = 'DISPUTED',
  DISPOSED = 'DISPOSED',
  INACTIVE = 'INACTIVE',
}

/** Audit + shared columns carried by every asset registry record. */
export interface AssetRegistryEntity {
  id?: number;
  uid?: string;
  assignedNumber?: string;
  name?: string;
  description?: string;
  active?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

/** Fields common to every asset registry input; `assignedNumber` is generated when blank. */
export interface AssetRegistryDtoInput {
  uid?: string;
  assignedNumber?: string;
  name: string;
  description: string;
}

export interface AssetType extends AssetRegistryEntity {
  forLand?: boolean;
}

export interface AssetTypeDtoInput extends AssetRegistryDtoInput {
  forLand?: boolean;
}

export interface AssetCategory extends AssetRegistryEntity {
  assetType?: AssetType;
}

export interface AssetCategoryDtoInput extends AssetRegistryDtoInput {
  assetTypeUid: string;
}

export interface AssetSubcategory extends AssetRegistryEntity {
  assetCategory?: AssetCategory;
}

export interface AssetSubcategoryDtoInput extends AssetRegistryDtoInput {
  assetCategoryUid: string;
}

export interface Asset extends AssetRegistryEntity {
  status?: AssetStatus;
  reserved?: boolean;
  assetSubcategory?: AssetSubcategory;
}

export interface AssetDtoInput extends AssetRegistryDtoInput {
  assetSubcategoryUid: string;
  reserved?: boolean;
  status?: AssetStatus;
}

export interface LandRegistration extends AssetRegistryEntity {
  asset?: Asset;
}

export interface LandRegistrationDtoInput extends AssetRegistryDtoInput {
  assetUid: string;
}

export interface AssetVerification extends AssetRegistryEntity {
  asset?: Asset;
}

export interface AssetVerificationDtoInput extends AssetRegistryDtoInput {
  assetUid: string;
}
