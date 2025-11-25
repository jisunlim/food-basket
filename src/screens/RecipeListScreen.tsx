import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../constants';
import { useRecipes } from '../hooks/useRecipes';
import { useRecommendations } from '../hooks/useRecommendations';
import { useCart } from '../hooks/useCart';
import { RecipeCard, SearchBar, RecommendationCard } from '../components';
import { RootStackParamList } from '../navigation/types';
import * as SQLite from 'expo-sqlite';

type NavigationProp = StackNavigationProp<RootStackParamList>;

type FilterType = 'all' | 'favorite' | 'recommendation';

type ListItem = 
  | { type: 'recipe'; data: any }
  | { type: 'recommendation'; data: any };

export const RecipeListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [cartIngredientIds, setCartIngredientIds] = useState<number[]>([]);

  const { recipes, loading: recipesLoading, error: recipesError, toggleFavorite, refresh: refreshRecipes } =
    useRecipes(filterType === 'favorite' ? { isFavorite: true } : undefined);
  
  const { recommendations, loading: recommendationsLoading, refresh: refreshRecommendations } = useRecommendations();
  const { cartItems, refresh: refreshCart } = useCart();

  // 화면이 포커스될 때마다 모든 데이터 새로고침
  useEffect(() => {
    if (isFocused) {
      refreshRecipes();
      refreshCart();
      refreshRecommendations();
    }
  }, [isFocused, refreshRecipes, refreshCart, refreshRecommendations]);

  // 장바구니 재료 ID 목록 가져오기
  React.useEffect(() => {
    const loadCartIngredients = async () => {
      try {
        const db = await SQLite.openDatabaseAsync('foodbasket.db');
        const result = await db.getAllAsync<any>(
          'SELECT DISTINCT ingredient_id FROM cart_items'
        );
        setCartIngredientIds(result.map((row) => row.ingredient_id));
      } catch (err) {
        console.error('장바구니 재료 로딩 실패:', err);
      }
    };

    loadCartIngredients();
  }, [cartItems]);

  // 장바구니에 담긴 레시피 ID 목록
  const cartRecipeIds = useMemo(() => {
    const recipeIds = new Set<number>();
    cartItems.forEach((group) => {
      group.data.forEach((item) => {
        item.recipes.forEach((recipeItem) => {
          recipeIds.add(recipeItem.recipe.id);
        });
      });
    });
    return recipeIds;
  }, [cartItems]);

  // 추천 레시피 ID 목록
  const recommendationRecipeIds = useMemo(() => {
    return new Set(recommendations.map(rec => rec.recipe.id));
  }, [recommendations]);

  // 검색어로 필터링된 레시피 (장바구니에 담긴 것 + 추천 대상 제외)
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      // 장바구니에 이미 담긴 레시피 제외
      if (cartRecipeIds.has(recipe.id)) {
        return false;
      }
      // 추천 대상인 레시피 제외 (추천 카드로만 표시)
      if (recommendationRecipeIds.has(recipe.id)) {
        return false;
      }
      if (searchQuery && !recipe.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [recipes, searchQuery, cartRecipeIds, recommendationRecipeIds]);

  // 리스트 병합 (가나다순 정렬)
  const mergedList = useMemo<ListItem[]>(() => {
    if (filterType === 'recommendation') {
      // 추천 목록: 가나다순 정렬
      return recommendations
        .sort((a, b) => a.recipe.name.localeCompare(b.recipe.name, 'ko'))
        .map((rec) => ({ type: 'recommendation', data: rec }));
    }

    if (filterType === 'favorite') {
      // 즐겨찾기: 가나다순 정렬
      return filteredRecipes
        .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
        .map((recipe) => ({ type: 'recipe', data: recipe }));
    }

    // 전체보기: 일반 레시피 + 추천 레시피를 모두 합쳐서 가나다순 정렬
    const allItems: ListItem[] = [
      ...filteredRecipes.map((recipe) => ({ type: 'recipe' as const, data: recipe })),
      ...recommendations.map((rec) => ({ type: 'recommendation' as const, data: rec })),
    ];

    return allItems.sort((a, b) => {
      const nameA = a.type === 'recipe' ? a.data.name : a.data.recipe.name;
      const nameB = b.type === 'recipe' ? b.data.name : b.data.recipe.name;
      return nameA.localeCompare(nameB, 'ko');
    });
  }, [filteredRecipes, recommendations, filterType]);

  // 장바구니 요약 계산
  const cartSummary = useMemo(() => {
    const recipeIds = new Set<number>();
    let ingredientCount = 0;

    cartItems.forEach((group) => {
      group.data.forEach((item) => {
        ingredientCount++;
        item.recipes.forEach((recipeItem) => {
          recipeIds.add(recipeItem.recipe.id);
        });
      });
    });

    return { recipeCount: recipeIds.size, ingredientCount };
  }, [cartItems]);

  const handleAddRecipe = () => {
    navigation.navigate('RecipeForm', {});
  };

  const handleRefresh = () => {
    refreshRecipes();
    refreshRecommendations();
    refreshCart();
  };

  const handleGoToCart = () => {
    navigation.navigate('Cart');
  };

  const loading = recipesLoading || recommendationsLoading;

  if (loading && mergedList.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>요리 목록을 불러오는 중...</Text>
      </View>
    );
  }

  if (recipesError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>⚠️ {recipesError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterType === 'all' && styles.filterButtonActive,
              ]}
              onPress={() => setFilterType('all')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterType === 'all' && styles.filterButtonTextActive,
                ]}
              >
                전체보기
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterType === 'favorite' && styles.filterButtonActive,
              ]}
              onPress={() => setFilterType('favorite')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterType === 'favorite' && styles.filterButtonTextActive,
                ]}
              >
                ★ 즐겨찾기
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterType === 'recommendation' && styles.filterButtonActive,
              ]}
              onPress={() => setFilterType('recommendation')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterType === 'recommendation' && styles.filterButtonTextActive,
                ]}
              >
                💡 추천
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddRecipe}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchSection}>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </View>
      </View>

      <FlatList
        data={mergedList}
        keyExtractor={(item: ListItem, index: number) => `${item.type}-${index}`}
        renderItem={({ item }: { item: ListItem }) => {
          if (item.type === 'recipe') {
            return (
              <RecipeCard
                recipe={item.data}
                onToggleFavorite={toggleFavorite}
                onCartUpdate={() => {
                  refreshCart();
                  refreshRecommendations();
                }}
              />
            );
          } else {
            return (
              <RecommendationCard
                recommendation={item.data}
                cartIngredientIds={cartIngredientIds}
                onCartUpdate={() => {
                  refreshCart();
                  refreshRecommendations();
                }}
              />
            );
          }
        }}
        contentContainerStyle={
          mergedList.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {filterType === 'all' && (
              <>
                <Text style={styles.emptyIcon}>🍳</Text>
                <Text style={styles.emptyTitle}>등록된 요리가 없습니다</Text>
                <Text style={styles.emptySubtitle}>
                  + 버튼을 눌러 첫 요리를 등록해보세요!
                </Text>
              </>
            )}
            {filterType === 'favorite' && (
              <>
                <Text style={styles.emptyIcon}>⭐</Text>
                <Text style={styles.emptyTitle}>즐겨찾는 요리가 없습니다</Text>
                <Text style={styles.emptySubtitle}>
                  요리 카드의 별 아이콘을 눌러{'\n'}즐겨찾기에 추가해보세요!
                </Text>
              </>
            )}
            {filterType === 'recommendation' && (
              <>
                <Text style={styles.emptyIcon}>🛒</Text>
                <Text style={styles.emptyTitle}>추천할 요리가 없습니다</Text>
                <Text style={styles.emptySubtitle}>
                  장바구니에 재료를 담으면{'\n'}만들 수 있는 요리를 추천해드려요!
                </Text>
              </>
            )}
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      {/* 하단 고정 요약바 */}
      <View style={styles.bottomBar}>
        <View style={styles.summarySection}>
          <Text style={styles.summaryText}>
            🛒 {cartSummary.recipeCount}개 레시피 · 재료 {cartSummary.ingredientCount}개
          </Text>
        </View>
        <TouchableOpacity style={styles.cartButton} onPress={handleGoToCart}>
          <Text style={styles.cartButtonText}>장바구니 보기 〉</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: colors.surface,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterButtons: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  searchSection: {
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  summarySection: {
    flex: 1,
  },
  summaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  cartButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cartButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
