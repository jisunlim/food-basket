import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../constants';
import { useRecipes } from '../hooks/useRecipes';
import { RecipeCard, SearchBar, IngredientFilter, TagFilter } from '../components';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const RecipeListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [showFavoriteOnly, setShowFavoriteOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const { recipes, loading, error, toggleFavorite, removeRecipe, refresh } =
    useRecipes(showFavoriteOnly ? { isFavorite: true } : undefined);

  // 필터링된 레시피 목록
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      // 검색어 필터
      if (searchQuery && !recipe.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // 재료 필터 (선택된 재료가 모두 포함되어야 함)
      if (selectedIngredients.length > 0) {
        const recipeIngredientIds = recipe.ingredients?.map((i) => i.id) || [];
        const hasAllIngredients = selectedIngredients.every((id) =>
          recipeIngredientIds.includes(id)
        );
        if (!hasAllIngredients) {
          return false;
        }
      }

      // 태그 필터 (선택된 태그 중 하나라도 포함되어야 함)
      if (selectedTags.length > 0) {
        const recipeTags = recipe.tags || [];
        const hasAnyTag = selectedTags.some((tag) => recipeTags.includes(tag));
        if (!hasAnyTag) {
          return false;
        }
      }

      return true;
    });
  }, [recipes, searchQuery, selectedIngredients, selectedTags]);

  const handleAddRecipe = () => {
    navigation.navigate('RecipeForm', {});
  };

  if (loading && recipes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>요리 목록을 불러오는 중...</Text>
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

  const hasActiveFilters = searchQuery || selectedIngredients.length > 0 || selectedTags.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              showFavoriteOnly && styles.filterButtonActive,
            ]}
            onPress={() => setShowFavoriteOnly(!showFavoriteOnly)}
          >
            <Text
              style={[
                styles.filterButtonText,
                showFavoriteOnly && styles.filterButtonTextActive,
              ]}
            >
              {showFavoriteOnly ? '★ 즐겨찾기만' : '☆ 전체보기'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddRecipe}>
            <Text style={styles.addButtonText}>+ 요리 추가</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchSection}>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </View>

        <View style={styles.filterSection}>
          <IngredientFilter
            value={selectedIngredients}
            onChange={setSelectedIngredients}
          />
          <TagFilter value={selectedTags} onChange={setSelectedTags} />
        </View>
      </View>

      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onToggleFavorite={toggleFavorite}
            onDelete={removeRecipe}
          />
        )}
        contentContainerStyle={
          filteredRecipes.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {hasActiveFilters
                ? '검색 결과가 없습니다'
                : showFavoriteOnly
                ? '즐겨찾는 요리가 없습니다'
                : '등록된 요리가 없습니다'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {hasActiveFilters
                ? '다른 검색어나 필터를 시도해보세요'
                : showFavoriteOnly
                ? '요리를 즐겨찾기에 추가해보세요'
                : '+ 버튼을 눌러 첫 요리를 추가해보세요'}
            </Text>
          </View>
        }
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterSection: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
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

