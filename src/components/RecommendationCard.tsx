import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../constants';
import { RecipeRecommendation } from '../types';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface Props {
  recommendation: RecipeRecommendation;
  cartIngredientIds: string[];
}

export const RecommendationCard: React.FC<Props> = ({
  recommendation,
  cartIngredientIds,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { recipe, missingRequiredCount } = recommendation;

  const handlePress = () => {
    navigation.navigate('RecipeDetail', { recipeId: recipe.id });
  };

  // 재료를 장바구니 보유/부족으로 분류
  const requiredIngredients = recipe.ingredients.filter((i) => i.isRequired);
  const optionalIngredients = recipe.ingredients.filter((i) => !i.isRequired);

  const hasIngredient = (ingredientId: string) => {
    return cartIngredientIds.includes(ingredientId);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <Text style={styles.title}>{recipe.name}</Text>
        {missingRequiredCount === 0 && (
          <View style={styles.readyBadge}>
            <Text style={styles.readyText}>✓ 바로 가능</Text>
          </View>
        )}
      </View>

      <View style={styles.ingredientsSection}>
        {requiredIngredients.length > 0 && (
          <View style={styles.ingredientGroup}>
            <Text style={styles.groupTitle}>필수 재료</Text>
            <View style={styles.ingredientList}>
              {requiredIngredients.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.ingredientChip,
                    hasIngredient(item.ingredientId)
                      ? styles.ingredientChipHave
                      : styles.ingredientChipMissing,
                  ]}
                >
                  <Text
                    style={[
                      styles.ingredientText,
                      hasIngredient(item.ingredientId)
                        ? styles.ingredientTextHave
                        : styles.ingredientTextMissing,
                    ]}
                  >
                    {hasIngredient(item.ingredientId) ? '✓' : '✗'}{' '}
                    {item.ingredient?.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {optionalIngredients.length > 0 && (
          <View style={styles.ingredientGroup}>
            <Text style={styles.groupTitle}>선택 재료</Text>
            <View style={styles.ingredientList}>
              {optionalIngredients.slice(0, 3).map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.ingredientChip,
                    styles.ingredientChipOptional,
                  ]}
                >
                  <Text style={styles.ingredientTextOptional}>
                    {item.ingredient?.name}
                  </Text>
                </View>
              ))}
              {optionalIngredients.length > 3 && (
                <Text style={styles.moreText}>
                  +{optionalIngredients.length - 3}
                </Text>
              )}
            </View>
          </View>
        )}
      </View>

      {recipe.tags && recipe.tags.length > 0 && (
        <View style={styles.tagsSection}>
          {recipe.tags.map((tag) => (
            <Text key={tag.id} style={styles.tag}>
              #{tag.tag}
            </Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  readyBadge: {
    backgroundColor: colors.success + '20',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  readyText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  ingredientsSection: {
    gap: 12,
  },
  ingredientGroup: {
    gap: 8,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  ingredientList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ingredientChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  ingredientChipHave: {
    backgroundColor: colors.success + '15',
    borderColor: colors.success,
  },
  ingredientChipMissing: {
    backgroundColor: colors.error + '15',
    borderColor: colors.error,
  },
  ingredientChipOptional: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  ingredientText: {
    fontSize: 13,
    fontWeight: '500',
  },
  ingredientTextHave: {
    color: colors.success,
  },
  ingredientTextMissing: {
    color: colors.error,
  },
  ingredientTextOptional: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  moreText: {
    fontSize: 13,
    color: colors.textSecondary,
    alignSelf: 'center',
    paddingHorizontal: 8,
  },
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  tag: {
    fontSize: 12,
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
});

