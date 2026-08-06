/**
 * Audit + shared columns carried by every project registry record.
 *
 * `id` is a uuid string, not a number. There is no `updatedAt` or `deletedAt`:
 * the DBA-owned schema records only creation.
 */
export interface ProjectRegistryEntity {
  id?: string;
  uid?: string;
  assignedNumber?: string;
  name?: string;
  description?: string;
  active?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
}

/** Fields common to every registry input; `assignedNumber` is generated when blank. */
export interface ProjectRegistryDtoInput {
  uid?: string;
  assignedNumber?: string;
  name: string;
  description: string;
}

export type ProjectCategory = ProjectRegistryEntity;

export type ProjectCategoryDtoInput = ProjectRegistryDtoInput & {
  projectCategoryUid: string;
};

export interface ProjectSubcategory extends ProjectRegistryEntity {
  projectCategory?: ProjectCategory;
}

export interface ProjectSubcategoryDtoInput extends ProjectRegistryDtoInput {
  projectCategoryUid: string;
}

export interface RegistryProject extends ProjectRegistryEntity {
  projectSubcategory?: ProjectSubcategory;
  latitude?: number;
  longitude?: number;
  startedAt?: string;
  endedAt?: string;
  /** Derived from the date range by the backend; not settable. */
  days?: number;
}

export interface RegistryProjectDtoInput extends ProjectRegistryDtoInput {
  projectSubcategoryUid: string;
  latitude: number;
  longitude: number;
  startedAt: string;
  endedAt: string;
}

export interface ProjectConnection extends ProjectRegistryEntity {
  parent?: RegistryProject;
  child?: RegistryProject;
  connectedAt?: string;
}

export interface ProjectConnectionDtoInput extends ProjectRegistryDtoInput {
  parentUid: string;
  childUid: string;
}

export interface CostType extends ProjectRegistryEntity {
  /** The table's own numeric column, required but unexplained by the schema. */
  costTypes?: number;
  latitude?: number;
  longitude?: number;
}

export interface CostTypeDtoInput extends ProjectRegistryDtoInput {
  costTypes: number;
  latitude: number;
  longitude: number;
}

export interface Cost extends ProjectRegistryEntity {
  amount?: number;
  costType?: CostType;
}

export interface CostDtoInput extends ProjectRegistryDtoInput {
  amount: number;
  costTypeUid: string;
}

export interface RegistryMasterPlan extends ProjectRegistryEntity {
  area?: number;
  latitude?: number;
  longitude?: number;
}

export interface RegistryMasterPlanDtoInput extends ProjectRegistryDtoInput {
  area: number;
  latitude: number;
  longitude: number;
}

/** The bridge carries only its two keys — no name, no audit block. */
export interface ProjectAsset {
  id?: string;
  project?: RegistryProject;
  asset?: { id?: string; uid?: string; assignedNumber?: string; name?: string };
}

export interface ProjectAssetDtoInput {
  projectUid: string;
  assetUid: string;
}
