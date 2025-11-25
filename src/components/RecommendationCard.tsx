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
import { colors } from '../constants';
import { RecipeRecommendation } from '../types';
import { RootStackParamList } from '../navigation/types';
import { useCart } from '../hooks/useCart';
import { showToast } from '../utils/toast';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface Props {
  recommendation: RecipeRecommendation;
  cartIngredientIds: number[];
  onCartUpdate?: () => void; // 장바구니 업데이트 콜백 추가
}

export const RecommendationCard: React.FC<Props> = ({
  recommendation,
  cartIngredientIds,
  onCartUpdate,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { addRecipeToCart, loading: cartLoading } = useCart();
  const { recipe, missingRequiredCount } = recommendation;
  const [servings, setServings] = useState(recipe.servings);

  const handlePress = () => {
    navigation.navigate('RecipeDetail', { recipeId: recipe.id });
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

  // 필수 재료 목록
  const requiredIngredients = recipe.ingredients.filter((i) => i.isRequired);
  
  // 부족한 재료 찾기
  const missingIngredients = requiredIngredients.filter(
    (i) => !cartIngredientIds.includes(i.ingredientId)
  );

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title}>{recipe.name}</Text>
        {missingRequiredCount === 0 && (
          <View style={styles.readyBadge}>
            <Text style={styles.badgeText}>재료 전부 담겨있어요!</Text>
          </View>
        )}
        {missingRequiredCount === 1 && missingIngredients.length > 0 && (
          <View style={styles.almostReadyBadge}>
            <Text style={styles.badgeText}>
              {missingIngredients[0].ingredient?.name}만 추가하면 돼요!
            </Text>
          </View>
        )}
      </View>

      <View style={styles.ingredientsSection}>
        <Text style={styles.ingredientLabel}>필수 재료:</Text>
        <Text style={styles.ingredientText}>
          {requiredIngredients.map((item) => item.ingredient?.name).join(', ')}
        </Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.servingsStepper}>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={(e: any) => {
              e.stopPropagation();
              handleServingsChange(-1);
            }}
          >
            <Text style={styles.stepperButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.stepperText}>{servings}인분</Text>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={(e: any) => {
              e.stopPropagation();
              handleServingsChange(1);
            }}
          >
            <Text style={styles.stepperButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.addToCartButton, cartLoading && styles.buttonDisabled]}
          onPress={handleAddToCart}
          disabled={cartLoading}
        >
          {cartLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.addToCartButtonText}>🛒 담기</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF4E6',
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
    borderColor: '#FFA726',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  readyBadge: {
    backgroundColor: '#FFA726',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  almostReadyBadge: {
    backgroundColor: '#FFA726',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  ingredientsSection: {
    marginBottom: 12,
  },
  ingredientLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  ingredientText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  servingsStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 4,
  },
  stepperButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 6,
  },
  stepperButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
  },
  stepperText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: 12,
    minWidth: 60,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
