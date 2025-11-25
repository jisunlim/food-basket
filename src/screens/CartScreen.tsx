import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import * as SQLite from 'expo-sqlite';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../constants';
import { useCart } from '../hooks/useCart';
import { formatCartAsText } from '../utils/shareCart';
import { formatAmount } from '../utils/formatAmount';
import { INGREDIENT_CATEGORIES, IngredientCategory } from '../types';
import { updateCartItemCheckbox } from '../database/operations';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type TabType = 'by-recipe' | 'by-ingredient';

export const CartScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const { cartItems, loading, error, clearAllCart, removeRecipeFromCart, updateRecipeServings, refresh } = useCart();
  const [activeTab, setActiveTab] = useState<TabType>('by-recipe');
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [expandedIngredients, setExpandedIngredients] = useState<Set<number>>(new Set());
  const pagerRef = useRef<PagerView>(null);

  useEffect(() => {
    const initDb = async () => {
      try {
        const database = await SQLite.openDatabaseAsync('foodbasket.db');
        setDb(database);
      } catch (err) {
        console.error('DB 연결 실패:', err);
      }
    };

    initDb();
  }, []);

  // 탭이 포커스될 때마다 새로고침
  useEffect(() => {
    if (isFocused) {
      refresh();
    }
  }, [isFocused, refresh]);

  // 요리별 데이터 구조
  const recipeData = useMemo(() => {
    const recipesMap = new Map<number, {
      recipe: any;
      servings: number;
      ingredients: {
        ingredient: any;
        amount: number;
        isRequired: boolean;
        skipPurchase: boolean;
      }[];
    }>();

    cartItems.forEach(group => {
      group.data.forEach(item => {
        item.recipes.forEach(recipeItem => {
          if (!recipesMap.has(recipeItem.recipe.id)) {
            recipesMap.set(recipeItem.recipe.id, {
              recipe: recipeItem.recipe,
              servings: recipeItem.servings,
              ingredients: [],
            });
          }
          const recipeEntry = recipesMap.get(recipeItem.recipe.id)!;
          recipeEntry.ingredients.push({
            ingredient: item.ingredient,
            amount: recipeItem.amount,
            isRequired: recipeItem.isRequired,
            skipPurchase: recipeItem.skipPurchase,
          });
        });
      });
    });

    // 필수 재료 먼저 정렬
    return Array.from(recipesMap.values()).map(recipeEntry => ({
      ...recipeEntry,
      ingredients: recipeEntry.ingredients.sort((a, b) => {
        if (a.isRequired && !b.isRequired) return -1;
        if (!a.isRequired && b.isRequired) return 1;
        return 0;
      })
    }));
  }, [cartItems]);

  // 재료별 섹션 데이터
  const sectionData = useMemo(() => {
    const sections: { title: string; data: any[] }[] = [];
    const categoryOrder = ['meat', 'seafood', 'vegetables', 'fruits', 'dairy', 'grains', 'sauces', 'seasonings', 'processed', 'others'];

    categoryOrder.forEach(categoryKey => {
      const categoryGroup = cartItems.find(group => group.category === categoryKey);
      if (categoryGroup && categoryGroup.data.length > 0) {
        sections.push({
          title: INGREDIENT_CATEGORIES[categoryKey as IngredientCategory] || categoryKey,
          data: categoryGroup.data,
        });
      }
    });
    return sections;
  }, [cartItems]);

  const toggleIngredientExpand = (ingredientId: number) => {
    setExpandedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientId)) {
        newSet.delete(ingredientId);
      } else {
        newSet.add(ingredientId);
      }
      return newSet;
    });
  };

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
    const pageIndex = tab === 'by-recipe' ? 0 : 1;
    pagerRef.current?.setPage(pageIndex);
  };

  const handlePageSelected = (e: any) => {
    const position = e.nativeEvent.position;
    setActiveTab(position === 0 ? 'by-recipe' : 'by-ingredient');
  };

  const handleToggleSkipPurchase = async (recipeId: number, ingredientId: number, currentSkipPurchase: boolean) => {
    if (!db) return;
    await updateCartItemCheckbox(db, recipeId, ingredientId, 'skip_purchase', !currentSkipPurchase);
    refresh();
  };

  const handleSkipOptionalIngredients = async () => {
    if (!db || !cartItems || cartItems.length === 0) return;

    // 모든 선택 재료를 '안살래요'로 표시
    for (const group of cartItems) {
      for (const item of group.data) {
        for (const recipeItem of item.recipes) {
          if (!recipeItem.isRequired && !recipeItem.skipPurchase) {
            await updateCartItemCheckbox(db, recipeItem.recipe.id, item.ingredient.id, 'skip_purchase', true);
          }
        }
      }
    }
    refresh();
  };

  const handleRemoveRecipe = (recipeId: number) => {
    Alert.alert(
      '항목 삭제',
      '이 요리의 재료를 장바구니에서 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => removeRecipeFromCart(recipeId),
        },
      ]
    );
  };

  const handleUpdateServings = (recipeId: number, newServings: number) => {
    updateRecipeServings(recipeId, newServings);
  };

  const handleClearCart = () => {
    Alert.alert(
      '장바구니 비우기',
      '장바구니의 모든 항목을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: clearAllCart,
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      const itemsToShare = cartItems
        .map((group) => ({
          ...group,
          data: group.data
            .map(item => ({
              ...item,
              recipes: item.recipes.filter(recipeItem => !recipeItem.skipPurchase)
            }))
            .filter(item => item.recipes.length > 0)
        }))
        .filter((group) => group.data.length > 0);

      const text = formatCartAsText(itemsToShare);
      await Share.share({
        message: text,
        title: '장보기 목록',
      });
    } catch (shareError) {
      console.error('공유 오류:', shareError);
      Alert.alert('오류', '공유하는데 실패했습니다.');
    }
  };

  const cartSummary = useMemo(() => {
    let totalRecipes = 0;
    let neededIngredients = 0;
    const uniqueRecipeIds = new Set<number>();

    cartItems.forEach(group => {
      group.data.forEach(item => {
        item.recipes.forEach(recipeItem => {
          uniqueRecipeIds.add(recipeItem.recipe.id);
          if (!recipeItem.skipPurchase) {
            neededIngredients++;
          }
        });
      });
    });
    totalRecipes = uniqueRecipeIds.size;

    return { totalRecipes, neededIngredients };
  }, [cartItems]);

  if (loading && cartItems.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>장바구니를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>장바구니가 비어있습니다.</Text>
          <Text style={styles.emptySubtitle}>
            요리 목록에서 원하는 요리를 담아보세요!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 요약 정보 */}
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>
          오늘 필요한 재료 {cartSummary.neededIngredients}개를 한 번에 모았어요.
        </Text>
        <TouchableOpacity
          style={styles.requiredOnlyButton}
          onPress={handleSkipOptionalIngredients}
        >
          <Text style={styles.requiredOnlyButtonText}>필수 재료만 선택</Text>
        </TouchableOpacity>
      </View>

      {/* 탭 네비게이션 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'by-recipe' && styles.tabActive]}
          onPress={() => handleTabPress('by-recipe')}
        >
          <Text style={[styles.tabText, activeTab === 'by-recipe' && styles.tabTextActive]}>
            요리별
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'by-ingredient' && styles.tabActive]}
          onPress={() => handleTabPress('by-ingredient')}
        >
          <Text style={[styles.tabText, activeTab === 'by-ingredient' && styles.tabTextActive]}>
            재료별
          </Text>
        </TouchableOpacity>
      </View>

      {/* 스와이프 가능한 페이저 */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        {/* 요리별 뷰 */}
        <View key="by-recipe" style={styles.pageContainer}>
          <FlatList
          data={recipeData}
          keyExtractor={(item) => item.recipe.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.recipeCard}>
              <View style={styles.recipeHeader}>
                <Text style={styles.recipeName}>{item.recipe.name}</Text>
                <View style={styles.recipeActions}>
                  <View style={styles.servingsStepper}>
                    <TouchableOpacity
                      style={styles.stepperButton}
                      onPress={() => handleUpdateServings(item.recipe.id, Math.max(1, item.servings - 1))}
                    >
                      <Text style={styles.stepperButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepperText}>{item.servings}인분</Text>
                    <TouchableOpacity
                      style={styles.stepperButton}
                      onPress={() => handleUpdateServings(item.recipe.id, Math.min(100, item.servings + 1))}
                    >
                      <Text style={styles.stepperButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveRecipe(item.recipe.id)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.ingredientsList}>
                {item.ingredients.map((ing, index) => (
                  <View key={index} style={styles.ingredientRow}>
                    <Text style={[styles.ingredientText, ing.skipPurchase && styles.textSkipped]}>
                      • {ing.ingredient.name} {formatAmount(ing.amount)}{ing.ingredient.unit}
                    </Text>
                    <View style={styles.ingredientBadges}>
                      <View
                        style={[
                          styles.badge,
                          ing.isRequired ? styles.requiredBadge : styles.optionalBadge,
                        ]}
                      >
                        <Text style={styles.badgeText}>
                          {ing.isRequired ? '필수' : '선택'}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.skipCheckbox}
                        onPress={() => handleToggleSkipPurchase(item.recipe.id, ing.ingredient.id, ing.skipPurchase)}
                      >
                        <Text style={styles.skipCheckboxText}>
                          {ing.skipPurchase ? '☑' : '☐'} 안살래요
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
        </View>

        {/* 재료별 뷰 */}
        <View key="by-ingredient" style={styles.pageContainer}>
          <SectionList
          sections={sectionData}
          keyExtractor={(item, index) => `${item.ingredient.id}-${index}`}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item }) => {
            const isExpanded = expandedIngredients.has(item.ingredient.id);
            const allSkipped = item.recipes.every((r: any) => r.skipPurchase);

            return (
              <View style={[styles.ingredientCard, allSkipped && styles.ingredientCardSkipped]}>
                <TouchableOpacity
                  style={styles.ingredientHeader}
                  onPress={() => toggleIngredientExpand(item.ingredient.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.ingredientInfo}>
                    <Text style={[styles.ingredientName, allSkipped && styles.textSkipped]}>
                      {item.ingredient.name}
                    </Text>
                    <Text style={[styles.ingredientAmount, allSkipped && styles.textSkipped]}>
                      {formatAmount(item.totalAmount)}
                      {item.ingredient.unit}
                    </Text>
                  </View>
                  <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.recipesList}>
                    {item.recipes.map((recipeItem: any, index: number) => (
                      <View key={index} style={styles.recipeRow}>
                        <Text style={[styles.recipeRowName, recipeItem.skipPurchase && styles.textSkipped]}>
                          · {recipeItem.recipe.name}
                        </Text>
                        <View style={styles.recipeRowActions}>
                          <View
                            style={[
                              styles.badge,
                              recipeItem.isRequired ? styles.requiredBadge : styles.optionalBadge,
                            ]}
                          >
                            <Text style={styles.badgeText}>
                              {recipeItem.isRequired ? '필수' : '선택'}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.skipCheckboxInline}
                            onPress={() => handleToggleSkipPurchase(recipeItem.recipe.id, item.ingredient.id, recipeItem.skipPurchase)}
                          >
                            <Text style={styles.skipCheckboxText}>
                              {recipeItem.skipPurchase ? '☑' : '☐'} 안살래요
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
        </View>
      </PagerView>

      {/* 하단 공유 영역 */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>
            실제 구매 필요: {cartSummary.neededIngredients}개 재료
          </Text>
        </View>
        <View style={styles.footerButtons}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>공유하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearCart}
          >
            <Text style={styles.clearButtonText}>비우기</Text>
          </TouchableOpacity>
        </View>
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
  summaryHeader: {
    backgroundColor: colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  requiredOnlyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  requiredOnlyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  recipeCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recipeName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  recipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  servingsStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepperButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  stepperText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    minWidth: 50,
    textAlign: 'center',
  },
  removeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: 16,
  },
  removeButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  ingredientText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  ingredientBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requiredBadge: {
    backgroundColor: '#FFE5E5',
  },
  optionalBadge: {
    backgroundColor: '#E5F5FF',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  skipCheckbox: {
    paddingVertical: 4,
  },
  skipCheckboxInline: {
    paddingVertical: 4,
  },
  skipCheckboxText: {
    fontSize: 13,
    color: colors.text,
  },
  textSkipped: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  ingredientCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ingredientCardSkipped: {
    opacity: 0.5,
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ingredientInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 12,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  ingredientAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  expandIcon: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  recipesList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  recipeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  recipeRowName: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  recipeRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  footerInfo: {
    marginBottom: 12,
  },
  footerText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
  },
  clearButtonText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
});
