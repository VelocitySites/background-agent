// ============================================
// TEAM TYPES
// ============================================

export interface TeamMember {
  id: string;
  slug: string;
  name: string;
  role: string;
  title: string;
  quote: string;
  bio: string;
  funFacts: string[];
  heroImage: string;
  gallery: string[];
  socialLinks?: SocialLinks;
  order: number;
  joinedAt: Date;
}

export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  website?: string;
}

// ============================================
// PRODUCT TYPES
// ============================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  slot: ClothingSlot;
  order: number;
}

export type ClothingSlot = "head" | "top" | "bottom" | "feet" | "accessory";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: Category;
  variants: ProductVariant[];
  images: ProductImage[];
  modelImages: ModelImage[];
  isActive: boolean;
  isFeatured: boolean;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex?: string;
  stock: number;
  sku: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  order: number;
}

export interface ModelImage {
  id: string;
  url: string;
  alt: string;
  slot: ClothingSlot;
}

// ============================================
// OUTFIT TYPES
// ============================================

export interface Outfit {
  id: string;
  name: string;
  slug: string;
  description?: string;
  heroImage: string;
  items: OutfitItem[];
  isFeatured: boolean;
  order: number;
}

export interface OutfitItem {
  id: string;
  productId: string;
  product?: Product;
  slot: ClothingSlot;
}

// ============================================
// SHOPPING TYPES
// ============================================

export interface CartItem {
  id: string;
  variant: ProductVariant;
  product: Product;
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

// ============================================
// MODEL SELECTION STATE
// ============================================

export interface ModelState {
  baseImage: string | null; // User's uploaded photo or default model
  isCustomPhoto: boolean;
  selectedItems: {
    [key in ClothingSlot]?: {
      product: Product;
      variant: ProductVariant;
    };
  };
}

// ============================================
// ONBOARDING STATE
// ============================================

export interface OnboardingSection {
  id: string;
  title: string;
  subtitle?: string;
  content?: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  leftModelOutfit?: Outfit;
  rightModelOutfit?: Outfit;
}

// ============================================
// STORY CONTENT
// ============================================

export interface StorySection {
  id: string;
  slug: string;
  title: string;
  content: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  order: number;
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
