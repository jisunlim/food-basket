// 요리 타입
export interface Recipe {
  id: string;
  name: string;
  servings: number; // 기본 인분
  isFavorite: boolean;
  instructions?: string; // 요리 과정
  createdAt: Date;
  updatedAt: Date;
  ingredients?: Ingredient[]; // 목록 조회 시 포함
  tags?: string[]; // 목록 조회 시 포함
}

// 식재료 타입
export interface Ingredient {
  id: string;
  name: string;
  unit: string; // 단위 (g, ml, 개 등)
}

// 요리-재료 연결 타입
export interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredientId: string;
  amount: number; // 재료 양
  isRequired: boolean; // 필수/선택 여부
  ingredient?: Ingredient; // 조인 시 사용
}

// 태그 타입
export interface RecipeTag {
  id: string;
  recipeId: string;
  tag: string;
}

// 장바구니 아이템 타입
export interface CartItem {
  id: string;
  recipeId: string;
  ingredientId: string;
  amount: number;
  servings: number; // 몇 인분인지
  addedAt: Date;
  recipe?: Recipe; // 조인 시 사용
  ingredient?: Ingredient; // 조인 시 사용
}

// 요리 상세 정보 (재료 및 태그 포함)
export interface RecipeDetail extends Recipe {
  ingredients: RecipeIngredient[];
  tags: RecipeTag[];
}

// 장바구니 그룹화 타입 (재료별로 그룹화)
export interface CartItemGroup {
  ingredient: Ingredient;
  totalAmount: number;
  recipes: {
    recipe: Recipe;
    amount: number;
    servings: number;
  }[];
}

// 요리 추천 타입
export interface RecipeRecommendation {
  recipe: RecipeDetail;
  missingRequiredCount: number; // 부족한 필수 재료 수
  matchingIngredientCount: number; // 겹치는 재료 수
}

