import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { colors } from '../constants';
import { useCart } from '../hooks/useCart';
import { formatCartAsText } from '../utils/shareCart';
import { INGREDIENT_CATEGORIES } from '../types';

export const CartScreen: React.FC = () => {
  const { cartItems, loading, error, clearAllCart, refresh } = useCart();
  const isFocused = useIsFocused();

  // 탭이 포커스될 때마다 새로고침
  useEffect(() => {
    if (isFocused) {
      refresh();
    }
  }, [isFocused, refresh]);

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
      const text = formatCartAsText(cartItems);
      await Share.share({
        message: text,
        title: '장보기 목록',
      });
    } catch (error) {
      console.error('공유 오류:', error);
      Alert.alert('오류', '공유하는데 실패했습니다.');
    }
  };

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
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>장바구니가 비어있습니다</Text>
        <Text style={styles.emptySubtitle}>
          요리를 선택하여 재료를 추가해보세요
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={cartItems}
        keyExtractor={(item, index) => `${item.ingredient.id}-${index}`}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {INGREDIENT_CATEGORIES[section.category] || section.category}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.ingredientCard}>
            <View style={styles.ingredientHeader}>
              <Text style={styles.ingredientName}>{item.ingredient.name}</Text>
              <Text style={styles.ingredientAmount}>
                {item.totalAmount.toFixed(1)}
                {item.ingredient.unit}
              </Text>
            </View>
            <View style={styles.recipeList}>
              {item.recipes.map((recipeItem, index) => (
                <View key={index} style={styles.recipeItem}>
                  <View style={styles.recipeInfo}>
                    <Text style={styles.recipeName}>{recipeItem.recipe.name}</Text>
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
                  </View>
                  <Text style={styles.recipeDetail}>
                    {recipeItem.amount.toFixed(1)}
                    {item.ingredient.unit} ({recipeItem.servings}인분)
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={handleClearCart}
        >
          <Text style={styles.clearButtonText}>전체 삭제</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.shareButton]}
          onPress={handleShare}
        >
          <Text style={styles.shareButtonText}>공유하기</Text>
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
  listContent: {
    paddingBottom: 16,
  },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  ingredientCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  ingredientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  ingredientAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  recipeList: {
    gap: 8,
  },
  recipeItem: {
    paddingVertical: 8,
  },
  recipeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  recipeName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  requiredBadge: {
    backgroundColor: colors.required,
  },
  optionalBadge: {
    backgroundColor: colors.optional,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recipeDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: colors.error,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  shareButton: {
    backgroundColor: colors.primary,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
