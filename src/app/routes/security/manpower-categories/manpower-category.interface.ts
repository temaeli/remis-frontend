export interface ManpowerCategory {
  id?: number;
  uid?: string;
  name?: string;
  description?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ManpowerCategoryDtoInput {
  uid?: string;
  name: string;
  description: string;
}
