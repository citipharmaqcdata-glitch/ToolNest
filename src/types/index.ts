export type CategoryId =
  | 'all'
  | 'documents'
  | 'archive'
  | 'conversions'
  | 'chemistry'
  | 'laboratory'
  | 'math'
  | 'image'
  | 'developer'
  | 'text'
  | 'education'
  | 'daily';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  icon: string;
  toolCount?: number;
}

export interface ToolItem {
  id: string;
  name: string;
  shortDescription: string;
  category: CategoryId;
  categoryName: string;
  secondaryCategories?: CategoryId[];
  subCategory?: string;
  subCategories?: string[];
  iconName: string;
  tags: string[];
  isPopular?: boolean;
  status: 'available' | 'planned';
  badgeNote?: string;
}

export interface SubCategoryOption {
  id: string;
  name: string;
}

export type ModalType = 'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer' | 'github-guide' | null;
