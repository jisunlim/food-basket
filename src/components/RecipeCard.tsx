import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Recipe } from '../types';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../constants';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface Props {
  recipe: Recipe;
  onToggleFavorite: (recipeId: number, currentFavorite: boolean) => void;
  onDelete: (recipeId: number) => void;
}

export const RecipeCard: React.FC<Props> = ({
  recipe,
  onToggleFavorite,
  onDelete,
}) => {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    navigation.navigate('RecipeDetail', { recipeId: recipe.id });
  };

  const handleFavoritePress = () => {
    onToggleFavorite(recipe.id, recipe.isFavorite);
  };

  const handleDeletePress = () => {
    Alert.alert(
      '요리 삭제',
      `"${recipe.name}"을(를) 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => onDelete(recipe.id),
        },
      ]
    );
  };

  const handleEditPress = () => {
    navigation.navigate('RecipeForm', { recipeId: recipe.id });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{recipe.name}</Text>
          {recipe.isFavorite && (
            <Text style={styles.favoriteIcon}>⭐</Text>
          )}
        </View>
        <TouchableOpacity
          onPress={handleFavoritePress}
          style={styles.favoriteButton}
        >
          <Text style={styles.favoriteButtonText}>
            {recipe.isFavorite ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.servings}>{recipe.servings}인분</Text>
        {recipe.instructions && (
          <Text style={styles.instructions} numberOfLines={2}>
            {recipe.instructions}
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleEditPress}
        >
          <Text style={styles.actionButtonText}>수정</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDeletePress}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            삭제
          </Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  favoriteIcon: {
    fontSize: 16,
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteButtonText: {
    fontSize: 24,
    color: colors.favorite,
  },
  info: {
    marginBottom: 12,
  },
  servings: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  instructions: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  deleteButtonText: {
    color: '#FFFFFF',
  },
});

