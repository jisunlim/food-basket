// 요리 타입
export interface Recipe {
  id: number;
  name: string;
  servings: number; // 기본 인분
  isFavorite: boolean;
  instructions?: string; // 요리 과정
  createdAt: Date;
  updatedAt: Date;
  ingredients?: Ingredient[]; // 목록 조회 시 포함
  tags?: string[]; // 목록 조회 시 포함
}

// 식재료 카테고리
export type IngredientCategory =
  | 'meat'
  | 'seafood'
  | 'vegetables'
  | 'fruits'
  | 'dairy'
  | 'grains'
  | 'sauces'
  | 'seasonings'
  | 'processed'
  | 'others';

export const INGREDIENT_CATEGORIES: Record<IngredientCategory, string> = {
  meat: '육류',
  seafood: '해산물',
  vegetables: '채소',
  fruits: '과일',
  dairy: '유제품/계란',
  grains: '곡물/면류',
  sauces: '양념/소스',
  seasonings: '조미료/향신료',
  processed: '가공식품',
  others: '기타',
};

// 식재료 타입
export interface Ingredient {
  id: number;
  name: string;
  unit: string; // 단위 (g, ml, 개 등)
  category: IngredientCategory;
}

// 요리-재료 연결 타입
export interface RecipeIngredient {
  id: number;
  recipeId: number;
  ingredientId: number;
  amount: number; // 재료 양
  isRequired: boolean; // 필수/선택 여부
  ingredient?: Ingredient; // 조인 시 사용
}

// 태그 타입
export interface RecipeTag {
  id: number;
  recipeId: number;
  tag: string;
}

// 장바구니 아이템 타입
export interface CartItem {
  id: number;
  recipeId: number;
  ingredientId: number;
  amount: number;
  servings: number; // 몇 인분인지
  addedAt: Date;
  recipe?: Recipe; // 조인 시 사용
  ingredient?: Ingredient; // 조인 시 사용
}

// 요리 상세 정보 (재료 및 태그 포함)
export interface RecipeDetail extends Omit<Recipe, 'ingredients' | 'tags'> {
  ingredients: RecipeIngredient[];
  tags: RecipeTag[];
}

// 장바구니 그룹화 타입 (재료별로 그룹화)
export interface CartItemGroup {
  category: string;
  data: {
    ingredient: Ingredient;
    totalAmount: number;
    recipes: {
      recipe: Recipe;
      amount: number;
      servings: number;
      isRequired: boolean;
    }[];
  }[];
}

// 요리 추천 타입
export interface RecipeRecommendation {
  recipe: RecipeDetail;
  missingRequiredCount: number; // 부족한 필수 재료 수
  matchingIngredientCount: number; // 겹치는 재료 수
}

