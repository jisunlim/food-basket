import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../constants';
import { useRecipeDetail } from '../hooks/useRecipeDetail';
import { useCart } from '../hooks/useCart';
import { ServingStepper } from '../components/ServingStepper';

type RecipeDetailScreenRouteProp = RouteProp<RootStackParamList, 'RecipeDetail'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

interface Props {
  route: RecipeDetailScreenRouteProp;
}

export const RecipeDetailScreen: React.FC<Props> = ({ route }) => {
  const { recipeId } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const { recipe, loading, error } = useRecipeDetail(recipeId);
  const { addRecipeToCart, loading: cartLoading } = useCart();
  const [selectedServings, setSelectedServings] = useState(1);

  React.useEffect(() => {
    if (recipe) {
      setSelectedServings(recipe.servings);
    }
  }, [recipe]);

  const handleAddToCart = async () => {
    const success = await addRecipeToCart(recipeId, selectedServings);
    if (success) {
      Alert.alert(
        '장바구니에 추가됨',
        `${recipe?.name} (${selectedServings}인분)이 장바구니에 추가되었습니다.`,
        [
          { text: '계속 보기', style: 'cancel' },
          {
            text: '장바구니로',
            onPress: () => navigation.navigate('MainTabs', { screen: 'Cart' }),
          },
        ]
      );
    } else {
      Alert.alert('오류', '장바구니에 추가하는데 실패했습니다.');
    }
  };

  const handleEdit = () => {
    navigation.navigate('RecipeForm', { recipeId });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>요리 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>⚠️ {error || '요리를 찾을 수 없습니다'}</Text>
      </View>
    );
  }

  const multiplier = selectedServings / recipe.servings;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{recipe.name}</Text>
            {recipe.isFavorite && <Text style={styles.favoriteIcon}>⭐</Text>}
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>수정</Text>
          </TouchableOpacity>
        </View>

        {/* 인분 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>인분 선택</Text>
          <Text style={styles.baseServings}>
            기본: {recipe.servings}인분
          </Text>
          <ServingStepper
            value={selectedServings}
            onChange={setSelectedServings}
            min={1}
            max={20}
          />
        </View>

        {/* 필수 재료 */}
        {recipe.ingredients.filter((i) => i.isRequired).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>필수 재료</Text>
            {recipe.ingredients
              .filter((i) => i.isRequired)
              .map((item) => (
                <View key={item.id} style={styles.ingredientRow}>
                  <Text style={styles.ingredientName}>
                    • {item.ingredient?.name}
                  </Text>
                  <Text style={styles.ingredientAmount}>
                    {(item.amount * multiplier).toFixed(1)}
                    {item.ingredient?.unit}
                  </Text>
                </View>
              ))}
          </View>
        )}

        {/* 선택 재료 */}
        {recipe.ingredients.filter((i) => !i.isRequired).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>선택 재료</Text>
            {recipe.ingredients
              .filter((i) => !i.isRequired)
              .map((item) => (
                <View key={item.id} style={styles.ingredientRow}>
                  <Text style={[styles.ingredientName, styles.optionalText]}>
                    • {item.ingredient?.name}
                  </Text>
                  <Text style={[styles.ingredientAmount, styles.optionalText]}>
                    {(item.amount * multiplier).toFixed(1)}
                    {item.ingredient?.unit}
                  </Text>
                </View>
              ))}
          </View>
        )}

        {/* 태그 */}
        {recipe.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>태그</Text>
            <View style={styles.tagContainer}>
              {recipe.tags.map((tag) => (
                <View key={tag.id} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag.tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 요리 과정 */}
        {recipe.instructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>요리 과정</Text>
            <Text style={styles.instructions}>{recipe.instructions}</Text>
          </View>
        )}
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addToCartButton, cartLoading && styles.buttonDisabled]}
          onPress={handleAddToCart}
          disabled={cartLoading}
        >
          {cartLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.addToCartButtonText}>
              장바구니에 담기 ({selectedServings}인분)
            </Text>
          )}
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  baseServings: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  ingredientName: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  ingredientAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  optionalText: {
    color: colors.textSecondary,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
  },
  tagText: {
    fontSize: 14,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  instructions: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addToCartButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addToCartButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
});

