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
import { RecipeCard, SearchBar } from '../components';
import { FilterModal } from '../components/FilterModal';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const RecipeListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [showFavoriteOnly, setShowFavoriteOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const { recipes, loading, error, toggleFavorite, refresh } =
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

  const hasActiveFilters = selectedIngredients.length > 0 || selectedTags.length > 0;

  const handleClearFilters = () => {
    setSelectedIngredients([]);
    setSelectedTags([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={[
              styles.favoriteButton,
              showFavoriteOnly && styles.favoriteButtonActive,
            ]}
            onPress={() => setShowFavoriteOnly(!showFavoriteOnly)}
          >
            <Text
              style={[
                styles.favoriteButtonText,
                showFavoriteOnly && styles.favoriteButtonTextActive,
              ]}
            >
              {showFavoriteOnly ? '★' : '☆'}
            </Text>
          </TouchableOpacity>

          <View style={styles.searchWrapper}>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </View>

          <TouchableOpacity
            style={[styles.filterIconButton, hasActiveFilters && styles.filterIconButtonActive]}
            onPress={() => setShowFilterModal(true)}
          >
            <Text style={styles.filterIconText}>🔍</Text>
            {hasActiveFilters && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {selectedIngredients.length + selectedTags.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.addButton} onPress={handleAddRecipe}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        selectedIngredients={selectedIngredients}
        selectedTags={selectedTags}
        onIngredientsChange={setSelectedIngredients}
        onTagsChange={setSelectedTags}
        onClearAll={handleClearFilters}
      />

      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onToggleFavorite={toggleFavorite}
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
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: colors.warning + '20',
    borderColor: colors.warning,
  },
  favoriteButtonText: {
    fontSize: 22,
    color: colors.textSecondary,
  },
  favoriteButtonTextActive: {
    color: colors.warning,
  },
  searchWrapper: {
    flex: 1,
  },
  filterIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterIconButtonActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  filterIconText: {
    fontSize: 20,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: '300',
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

