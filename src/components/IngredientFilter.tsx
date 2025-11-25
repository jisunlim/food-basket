import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SectionList,
  ScrollView,
} from 'react-native';
import { colors } from '../constants';
import { useIngredients } from '../hooks/useIngredients';
import { SearchBar } from './SearchBar';
import { INGREDIENT_CATEGORIES, IngredientCategory } from '../types';

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
}

export const IngredientFilter: React.FC<Props> = ({ value, onChange }) => {
  const { ingredients } = useIngredients();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggle = (ingredientId: string) => {
    if (value.includes(ingredientId)) {
      onChange(value.filter((id) => id !== ingredientId));
    } else {
      onChange([...value, ingredientId]);
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  const getIngredientName = (ingredientId: string) => {
    return ingredients.find((i) => i.id === ingredientId)?.name || '';
  };

  const filteredIngredients = searchQuery
    ? ingredients.filter((i) =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : ingredients;

  // 카테고리별로 그룹화
  const groupedIngredients = useMemo(() => {
    const groups: { title: string; data: typeof ingredients }[] = [];
    const categoryMap = new Map<IngredientCategory, typeof ingredients>();

    filteredIngredients.forEach((ingredient) => {
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
  }, [filteredIngredients]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.filterButtonText}>
          🥘 재료 필터 {value.length > 0 && `(${value.length})`}
        </Text>
      </TouchableOpacity>

      {value.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.selectedContainer}
        >
          {value.map((ingredientId) => (
            <View key={ingredientId} style={styles.selectedChip}>
              <Text style={styles.selectedChipText}>
                {getIngredientName(ingredientId)}
              </Text>
              <TouchableOpacity
                onPress={() => handleToggle(ingredientId)}
                style={styles.removeChipButton}
              >
                <Text style={styles.removeChipButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={handleClear}
          >
            <Text style={styles.clearAllButtonText}>전체 해제</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>재료 선택</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="재료 검색..."
              />
            </View>

            <SectionList
              sections={groupedIngredients}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected = value.includes(item.id);
                return (
                  <TouchableOpacity
                    style={[
                      styles.ingredientItem,
                      isSelected && styles.ingredientItemSelected,
                    ]}
                    onPress={() => handleToggle(item.id)}
                  >
                    <Text
                      style={[
                        styles.ingredientName,
                        isSelected && styles.ingredientNameSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                    <View style={styles.ingredientRight}>
                      <Text style={styles.ingredientUnit}>({item.unit})</Text>
                      {isSelected && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{title}</Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>재료가 없습니다</Text>
              }
              stickySectionHeadersEnabled={true}
            />

            <View style={styles.modalFooter}>
              <Text style={styles.selectedCount}>
                {value.length}개 선택됨
              </Text>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.doneButtonText}>완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  selectedContainer: {
    flexDirection: 'row',
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    marginRight: 8,
  },
  selectedChipText: {
    fontSize: 14,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  removeChipButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  removeChipButtonText: {
    fontSize: 18,
    color: colors.primaryDark,
    fontWeight: '300',
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.error,
  },
  clearAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    fontSize: 28,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  searchContainer: {
    padding: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  ingredientItemSelected: {
    backgroundColor: colors.primaryLight + '30',
  },
  ingredientName: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  ingredientNameSelected: {
    fontWeight: '600',
    color: colors.primaryDark,
  },
  ingredientRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ingredientUnit: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  selectedCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  doneButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
});

