import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import { colors } from '../constants';
import { useIngredients } from '../hooks/useIngredients';
import { INGREDIENT_CATEGORIES, IngredientCategory } from '../types';

interface Props {
  value: number[];
  onChange: (value: number[]) => void;
}

export const IngredientFilterList: React.FC<Props> = ({ value, onChange }) => {
  const { ingredients } = useIngredients();

  const handleToggle = (ingredientId: number) => {
    if (value.includes(ingredientId)) {
      onChange(value.filter((id) => id !== ingredientId));
    } else {
      onChange([...value, ingredientId]);
    }
  };

  // 카테고리별로 그룹화
  const groupedIngredients = useMemo(() => {
    const groups: { title: string; data: typeof ingredients }[] = [];
    const categoryMap = new Map<IngredientCategory, typeof ingredients>();

    ingredients.forEach((ingredient) => {
      const category = ingredient.category || 'others';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(ingredient);
    });

    // 카테고리 순서대로 정렬
    const categoryOrder: IngredientCategory[] = [
      'meat',
      'seafood',
      'vegetables',
      'fruits',
      'dairy',
      'grains',
      'sauces',
      'seasonings',
      'processed',
      'others',
    ];

    categoryOrder.forEach((category) => {
      const items = categoryMap.get(category);
      if (items && items.length > 0) {
        groups.push({
          title: INGREDIENT_CATEGORIES[category],
          data: items,
        });
      }
    });

    return groups;
  }, [ingredients]);

  if (ingredients.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>재료 선택</Text>
        <Text style={styles.emptyText}>재료를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>재료 선택 ({ingredients.length}개)</Text>
      <SectionList
        sections={groupedIngredients}
        keyExtractor={(item) => item.id.toString()}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handleToggle(item.id)}
          >
            <Text style={styles.itemText}>{item.name}</Text>
            <View
              style={[
                styles.checkbox,
                value.includes(item.id) && styles.checkboxChecked,
              ]}
            >
              {value.includes(item.id) && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        style={styles.list}
        nestedScrollEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  list: {
    flex: 1,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  itemText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

