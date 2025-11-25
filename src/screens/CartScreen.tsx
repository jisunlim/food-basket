import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import { colors } from '../constants';
import { useCart } from '../hooks/useCart';
import { CartItemCard } from '../components/CartItemCard';
import { formatCartAsText } from '../utils/shareCart';

export const CartScreen: React.FC = () => {
  const { cartItems, loading, error, clearAllCart, removeRecipeFromCart, refresh } = useCart();

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

  const handleRemoveRecipe = (recipeId: string) => {
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

  const handleShare = async () => {
    try {
      const text = formatCartAsText(cartItems);
      await Share.share({
        message: text,
        title: '장보기 목록',
      });
    } catch (error) {
      console.error('공유 오류:', error);
      Alert.alert('오류', '공유에 실패했습니다.');
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

  return (
    <View style={styles.container}>
      {cartItems.length > 0 && (
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>장보기 목록</Text>
            <Text style={styles.headerSubtitle}>
              {cartItems.length}개 재료
            </Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
            >
              <Text style={styles.shareButtonText}>📤 공유</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearCart}
            >
              <Text style={styles.clearButtonText}>전체 삭제</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.ingredient.id}
        renderItem={({ item }) => (
          <CartItemCard group={item} onRemoveRecipe={handleRemoveRecipe} />
        )}
        contentContainerStyle={
          cartItems.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>장바구니가 비어있습니다</Text>
            <Text style={styles.emptySubtitle}>
              요리 상세 화면에서{'\n'}재료를 장바구니에 담아보세요
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
  headerInfo: {
    marginBottom: 12,
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
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  shareButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.error + '20',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
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

