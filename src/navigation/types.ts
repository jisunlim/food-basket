// Stack Navigator 타입
export type RootStackParamList = {
  Home: undefined;
  Cart: undefined;
  RecipeDetail: { recipeId: number };
  RecipeForm: { recipeId?: number }; // undefined면 새 요리 등록
};

// 네비게이션 프롭 타입 헬퍼
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

