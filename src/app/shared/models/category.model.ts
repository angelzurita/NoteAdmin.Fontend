export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}
