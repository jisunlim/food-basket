import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Recipe } from '../types';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../constants';
import { useCart } from '../hooks/useCart';
import { showToast } from '../utils/toast';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface Props {
  recipe: Recipe;
  onToggleFavorite: (recipeId: number, currentFavorite: boolean) => void;
  onCartUpdate?: () => void; // 장바구니 업데이트 콜백 추가
}

export const RecipeCard: React.FC<Props> = ({
  recipe,
  onToggleFavorite,
  onCartUpdate,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { addRecipeToCart, loading: cartLoading } = useCart();
  const [servings, setServings] = useState(recipe.servings);

  const handlePress = () => {
    navigation.navigate('RecipeDetail', { recipeId: recipe.id });
  };

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    onToggleFavorite(recipe.id, recipe.isFavorite);
  };

  const handleServingsChange = (delta: number) => {
    const newServings = Math.max(1, Math.min(100, servings + delta));
    setServings(newServings);
  };

  const handleAddToCart = async (e: any) => {
    e.stopPropagation();
    try {
      const success = await addRecipeToCart(recipe.id, servings);
      if (success) {
        showToast(`${recipe.name} (${servings}인분) 담기 완료`);
        // 장바구니 업데이트 콜백 호출
        if (onCartUpdate) {
          onCartUpdate();
        }
      } else {
        showToast('장바구니에 추가하는데 실패했습니다.');
      }
    } catch (error) {
      console.error('장바구니 추가 오류:', error);
      showToast('장바구니에 추가하는데 실패했습니다.');
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        recipe.isFavorite && styles.containerFavorite,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{recipe.name}</Text>
        </View>
        {recipe.isFavorite && (
          <View style={styles.favoriteBadge}>
            <Text style={styles.favoriteBadgeText}>내가 좋아하는 요리</Text>
          </View>
        )}
      </View>

      {recipe.instructions && (
        <Text style={styles.instructions} numberOfLines={2}>
          {recipe.instructions}
        </Text>
      )}

      <View style={styles.actions}>
        <View style={styles.servingsControl}>
          <TouchableOpacity
            style={styles.servingsButton}
            onPress={(e) => {
              e.stopPropagation();
              handleServingsChange(-1);
            }}
          >
            <Text style={styles.servingsButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.servingsText}>{servings}인분</Text>
          <TouchableOpacity
            style={styles.servingsButton}
            onPress={(e) => {
              e.stopPropagation();
              handleServingsChange(1);
            }}
          >
            <Text style={styles.servingsButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.cartButton, cartLoading && styles.cartButtonDisabled]}
          onPress={handleAddToCart}
          disabled={cartLoading}
        >
          {cartLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.cartButtonText}>🛒 담기</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  containerFavorite: {
    backgroundColor: '#FFF9E6',
    borderColor: '#FFD700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  favoriteBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  favoriteBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8B6914',
  },
  instructions: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  servingsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 4,
  },
  servingsButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 6,
  },
  servingsButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
  },
  servingsText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: 12,
    minWidth: 60,
    textAlign: 'center',
  },
  cartButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButtonDisabled: {
    opacity: 0.6,
  },
  cartButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

