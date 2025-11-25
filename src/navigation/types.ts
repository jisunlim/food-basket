import { NavigatorScreenParams } from '@react-navigation/native';

// Stack Navigator 타입
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  RecipeDetail: { recipeId: string };
  RecipeForm: { recipeId?: string }; // undefined면 새 요리 등록
};

// Bottom Tab Navigator 타입
export type MainTabParamList = {
  RecipeList: undefined;
  Cart: undefined;
  Recommendation: undefined;
};

// 네비게이션 프롭 타입 헬퍼
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

