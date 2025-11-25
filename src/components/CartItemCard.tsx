import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../constants';
import { Recipe, Ingredient } from '../types';

interface Props {
  ingredient: Ingredient;
  totalAmount: number;
  recipes: {
    recipe: Recipe;
    amount: number;
    servings: number;
    isRequired: boolean;
  }[];
  onRemoveRecipe: (recipeId: number) => void;
  onUpdateServings: (recipeId: number, newServings: number) => void;
}

export const CartItemCard: React.FC<Props> = ({ 
  ingredient, 
  totalAmount, 
  recipes,
  onRemoveRecipe,
  onUpdateServings
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.ingredientInfo}>
          <Text style={styles.ingredientName}>{ingredient.name}</Text>
          <Text style={styles.totalAmount}>
            {totalAmount}
            {ingredient.unit}
          </Text>
        </View>
        <Text style={styles.expandIcon}>{expanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.recipeList}>
          {recipes.map((recipeInfo) => (
            <View key={recipeInfo.recipe.id} style={styles.recipeItem}>
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeName}>
                  {recipeInfo.recipe.name}
                </Text>
                <Text style={styles.recipeDetail}>
                  {recipeInfo.servings}인분 · {recipeInfo.amount}
                  {ingredient.unit}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemoveRecipe(recipeInfo.recipe.id)}
              >
                <Text style={styles.removeButtonText}>삭제</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  expandIcon: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  recipeList: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingVertical: 8,
  },
  recipeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  recipeDetail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.error + '20',
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.error,
  },
});

