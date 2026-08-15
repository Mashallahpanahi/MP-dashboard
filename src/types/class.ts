// src/types/class.ts

export interface Class {
  id: string;
  className: string;
  block:string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassData {
  className: string;    // Required
  block?: string | null;      // Required
  isActive?: boolean;   // Optional (default: true)
}

export interface UpdateClassData extends Partial<CreateClassData> {
  id?: string;
}