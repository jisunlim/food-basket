import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';
import { colors } from '../constants';
import { useRecommendations } from '../hooks/useRecommendations';
import { RecommendationCard } from '../components/RecommendationCard';

export const RecommendationScreen: React.FC = () => {
  const { recommendations, loading, error, refresh } = useRecommendations();
  const [cartIngredientIds, setCartIngredientIds] = useState<number[]>([]);
  const isFocused = useIsFocused();

  // 탭이 포커스될 때마다 새로고침
  useEffect(() => {
    if (isFocused) {
      refresh();
    }
  }, [isFocused, refresh]);

  // 장바구니 재료 ID 목록 가져오기
  useEffect(() => {
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
  }, [recommendations]);

  if (loading && recommendations.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>추천 요리를 찾는 중...</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>장바구니 기반 추천</Text>
        <Text style={styles.headerSubtitle}>
          장바구니에 담긴 재료로 만들 수 있는 요리를 추천해드려요
        </Text>
        <Text style={styles.headerNote}>
          💡 필수 재료가 최대 1개만 부족한 요리를 보여줍니다
        </Text>
      </View>

      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.recipe.id}
        renderItem={({ item }) => (
          <RecommendationCard
            recommendation={item}
            cartIngredientIds={cartIngredientIds}
          />
        )}
        contentContainerStyle={
          recommendations.length === 0
            ? styles.emptyContainer
            : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>추천할 요리가 없습니다</Text>
            <Text style={styles.emptySubtitle}>
              장바구니에 재료를 담으면{'\n'}만들 수 있는 요리를 추천해드려요
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  filterSection: {
    marginTop: 8,
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
    lineHeight: 20,
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

