import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import { colors } from '../constants';
import { Ingredient } from '../types';
import { useIngredients } from '../hooks/useIngredients';

interface IngredientItem {
  ingredientId: string;
  amount: number;
  isRequired: boolean;
}

interface Props {
  value: IngredientItem[];
  onChange: (value: IngredientItem[]) => void;
}

export const IngredientInput: React.FC<Props> = ({ value, onChange }) => {
  const { ingredients, searchIngredients, addIngredient } = useIngredients();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [amount, setAmount] = useState('');
  const [isRequired, setIsRequired] = useState(true);

  const handleAddIngredient = () => {
    setModalVisible(true);
    setSearchQuery('');
    setSelectedIngredient(null);
    setAmount('');
    setIsRequired(true);
  };

  const handleSelectIngredient = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setSearchQuery(ingredient.name);
  };

  const handleConfirm = () => {
    if (!selectedIngredient) {
      Alert.alert('오류', '재료를 선택해주세요');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('오류', '올바른 양을 입력해주세요');
      return;
    }

    // 중복 체크
    if (value.some((item) => item.ingredientId === selectedIngredient.id)) {
      Alert.alert('오류', '이미 추가된 재료입니다');
      return;
    }

    onChange([
      ...value,
      {
        ingredientId: selectedIngredient.id,
        amount: amountNum,
        isRequired,
      },
    ]);

    setModalVisible(false);
  };

  const handleRemove = (ingredientId: string) => {
    onChange(value.filter((item) => item.ingredientId !== ingredientId));
  };

  const handleToggleRequired = (ingredientId: string) => {
    onChange(
      value.map((item) =>
        item.ingredientId === ingredientId
          ? { ...item, isRequired: !item.isRequired }
          : item
      )
    );
  };

  const getIngredientName = (ingredientId: string) => {
    return ingredients.find((i) => i.id === ingredientId)?.name || '';
  };

  const getIngredientUnit = (ingredientId: string) => {
    return ingredients.find((i) => i.id === ingredientId)?.unit || '';
  };

  const filteredIngredients = searchIngredients(searchQuery);

  return (
    <View style={styles.container}>
      {value.map((item) => (
        <View key={item.ingredientId} style={styles.ingredientItem}>
          <View style={styles.ingredientInfo}>
            <Text style={styles.ingredientName}>
              {getIngredientName(item.ingredientId)}
            </Text>
            <Text style={styles.ingredientAmount}>
              {item.amount}
              {getIngredientUnit(item.ingredientId)}
            </Text>
            <TouchableOpacity
              style={[
                styles.requiredBadge,
                !item.isRequired && styles.optionalBadge,
              ]}
              onPress={() => handleToggleRequired(item.ingredientId)}
            >
              <Text style={styles.badgeText}>
                {item.isRequired ? '필수' : '선택'}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => handleRemove(item.ingredientId)}
            style={styles.removeButton}
          >
            <Text style={styles.removeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={handleAddIngredient}>
        <Text style={styles.addButtonText}>+ 재료 추가</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>재료 추가</Text>

            <TextInput
              style={styles.searchInput}
              placeholder="재료 검색..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {searchQuery && !selectedIngredient && (
              <FlatList
                data={filteredIngredients}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => handleSelectIngredient(item)}
                  >
                    <Text style={styles.searchResultName}>{item.name}</Text>
                    <Text style={styles.searchResultUnit}>({item.unit})</Text>
                  </TouchableOpacity>
                )}
                style={styles.searchResults}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
                }
              />
            )}

            {selectedIngredient && (
              <>
                <View style={styles.selectedIngredient}>
                  <Text style={styles.selectedText}>
                    선택: {selectedIngredient.name}
                  </Text>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder={`양 (${selectedIngredient.unit})`}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />

                <TouchableOpacity
                  style={styles.requiredToggle}
                  onPress={() => setIsRequired(!isRequired)}
                >
                  <Text style={styles.requiredToggleText}>
                    {isRequired ? '✓ 필수 재료' : '선택 재료'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>추가</Text>
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
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ingredientInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ingredientName: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  ingredientAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  requiredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.required,
  },
  optionalBadge: {
    backgroundColor: colors.optional,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  removeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 28,
    color: colors.error,
    fontWeight: '300',
  },
  addButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  searchResults: {
    maxHeight: 200,
    marginBottom: 12,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  searchResultName: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  searchResultUnit: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  selectedIngredient: {
    padding: 12,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  requiredToggle: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: 16,
  },
  requiredToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

