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
  ScrollView,
} from 'react-native';
import { colors } from '../constants';
import { Ingredient } from '../types';
import { useIngredients } from '../hooks/useIngredients';

// 한국에서 자주 사용되는 단위
const COMMON_UNITS = ['g', 'ml', 'kg', 'L', '개', '큰술', '작은술', '컵', '모', '줌', '꼬집'];

interface IngredientItem {
  ingredientId: number;
  amount: number;
  isRequired: boolean;
}

interface Props {
  value: IngredientItem[];
  onChange: (value: IngredientItem[]) => void;
}

export const IngredientInput: React.FC<Props> = ({ value, onChange }) => {
  const { ingredients, searchIngredients, createIngredient } = useIngredients();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [amount, setAmount] = useState('');
  const [isRequired, setIsRequired] = useState(true);
  const [editingIngredientId, setEditingIngredientId] = useState<number | null>(null);
  const [newIngredientUnit, setNewIngredientUnit] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const handleAddIngredient = () => {
    setModalVisible(true);
    setSearchQuery('');
    setSelectedIngredient(null);
    setAmount('');
    setIsRequired(true);
    setEditingIngredientId(null);
    setNewIngredientUnit('');
    setIsCreatingNew(false);
  };

  const handleEditIngredient = (item: IngredientItem) => {
    const ingredient = ingredients.find((i) => i.id === item.ingredientId);
    if (ingredient) {
      setEditingIngredientId(item.ingredientId);
      setSelectedIngredient(ingredient);
      setSearchQuery(ingredient.name);
      setAmount(item.amount.toString());
      setIsRequired(item.isRequired);
      setModalVisible(true);
      setIsCreatingNew(false);
    }
  };

  const handleSelectIngredient = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setSearchQuery(ingredient.name);
    setIsCreatingNew(false);
  };

  const handleCreateNewIngredient = () => {
    if (!searchQuery.trim()) {
      Alert.alert('오류', '재료 이름을 입력해주세요');
      return;
    }
    setIsCreatingNew(true);
    setNewIngredientUnit(COMMON_UNITS[0]); // 기본값: 'g'
  };

  const handleConfirm = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('오류', '올바른 양을 입력해주세요');
      return;
    }

    let ingredientId: number;

    if (isCreatingNew) {
      // 새 재료 생성
      if (!searchQuery.trim() || !newIngredientUnit.trim()) {
        Alert.alert('오류', '재료 이름과 단위를 입력해주세요');
        return;
      }
      const newIngredient = await createIngredient(searchQuery.trim(), newIngredientUnit.trim());
      if (!newIngredient) {
        Alert.alert('오류', '재료 생성에 실패했습니다');
        return;
      }
      ingredientId = newIngredient.id;
    } else {
      if (!selectedIngredient) {
        Alert.alert('오류', '재료를 선택해주세요');
        return;
      }
      ingredientId = selectedIngredient.id;
    }

    if (editingIngredientId !== null) {
      // 수정 모드
      onChange(
        value.map((item) =>
          item.ingredientId === editingIngredientId
            ? { ...item, amount: amountNum, isRequired }
            : item
        )
      );
    } else {
      // 추가 모드
      // 중복 체크
      if (value.some((item) => item.ingredientId === ingredientId)) {
        Alert.alert('오류', '이미 추가된 재료입니다');
        return;
      }

      onChange([
        ...value,
        {
          ingredientId,
          amount: amountNum,
          isRequired,
        },
      ]);
    }

    setModalVisible(false);
  };

  const handleRemove = (ingredientId: number) => {
    onChange(value.filter((item) => item.ingredientId !== ingredientId));
  };

  const getIngredientName = (ingredientId: number) => {
    return ingredients.find((i) => i.id === ingredientId)?.name || '';
  };

  const getIngredientUnit = (ingredientId: number) => {
    return ingredients.find((i) => i.id === ingredientId)?.unit || '';
  };

  const filteredIngredients = searchIngredients(searchQuery);

  return (
    <View style={styles.container}>
      {value.map((item) => (
        <TouchableOpacity
          key={item.ingredientId}
          style={styles.ingredientItem}
          onPress={() => handleEditIngredient(item)}
          activeOpacity={0.7}
        >
          <View style={styles.ingredientInfo}>
            <Text style={styles.ingredientName}>
              {getIngredientName(item.ingredientId)}
            </Text>
            <Text style={styles.ingredientAmount}>
              {item.amount}
              {getIngredientUnit(item.ingredientId)}
            </Text>
            <View
              style={[
                styles.requiredBadge,
                !item.isRequired && styles.optionalBadge,
              ]}
            >
              <Text style={styles.badgeText}>
                {item.isRequired ? '필수' : '선택'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleRemove(item.ingredientId);
            }}
            style={styles.removeButton}
          >
            <Text style={styles.removeButtonText}>×</Text>
          </TouchableOpacity>
        </TouchableOpacity>
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingIngredientId ? '재료 수정' : '재료 추가'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {!editingIngredientId && !selectedIngredient && !isCreatingNew && (
              <>
                <TextInput
                  style={styles.searchInput}
                  placeholder="재료 검색..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />

                {searchQuery && (
                  <>
                    <FlatList
                      data={filteredIngredients}
                      keyExtractor={(item) => item.id.toString()}
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
                    />
                    {filteredIngredients.length === 0 && (
                      <TouchableOpacity
                        style={styles.createNewButton}
                        onPress={handleCreateNewIngredient}
                      >
                        <Text style={styles.createNewButtonText}>
                          "{searchQuery}" 새로 추가
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </>
            )}

            {(selectedIngredient || isCreatingNew || editingIngredientId) && (
              <>
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>재료</Text>
                  <Text style={styles.ingredientNameDisplay}>
                    {isCreatingNew ? searchQuery : selectedIngredient?.name}
                  </Text>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>양과 단위</Text>
                  <View style={styles.amountRow}>
                    <TextInput
                      style={styles.amountInput}
                      placeholder="예: 200"
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="numeric"
                    />
                    {isCreatingNew ? (
                      <View style={styles.unitSelector}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {COMMON_UNITS.map((unit) => (
                            <TouchableOpacity
                              key={unit}
                              style={[
                                styles.unitButton,
                                newIngredientUnit === unit && styles.unitButtonActive,
                              ]}
                              onPress={() => setNewIngredientUnit(unit)}
                            >
                              <Text
                                style={[
                                  styles.unitButtonText,
                                  newIngredientUnit === unit && styles.unitButtonTextActive,
                                ]}
                              >
                                {unit}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    ) : (
                      <View style={styles.unitDisplay}>
                        <Text style={styles.unitDisplayText}>
                          {selectedIngredient?.unit}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>필수 여부</Text>
                  <View style={styles.requiredButtons}>
                    <TouchableOpacity
                      style={[
                        styles.requiredButton,
                        isRequired && styles.requiredButtonActive,
                      ]}
                      onPress={() => setIsRequired(true)}
                    >
                      <Text
                        style={[
                          styles.requiredButtonText,
                          isRequired && styles.requiredButtonTextActive,
                        ]}
                      >
                        필수
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.requiredButton,
                        !isRequired && styles.optionalButtonActive,
                      ]}
                      onPress={() => setIsRequired(false)}
                    >
                      <Text
                        style={[
                          styles.requiredButtonText,
                          !isRequired && styles.requiredButtonTextActive,
                        ]}
                      >
                        선택
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelModalButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelModalButtonText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleConfirm}
                  >
                    <Text style={styles.confirmButtonText}>
                      {editingIngredientId ? '수정' : '추가'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  createNewButton: {
    padding: 12,
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  createNewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  formSection: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  ingredientNameDisplay: {
    fontSize: 16,
    color: colors.text,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  amountRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  unitSelector: {
    flex: 1,
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
    backgroundColor: colors.surface,
  },
  unitButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  unitButtonTextActive: {
    color: '#FFFFFF',
  },
  unitDisplay: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  unitDisplayText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  requiredButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  requiredButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  requiredButtonActive: {
    backgroundColor: colors.required,
    borderColor: colors.required,
  },
  optionalButtonActive: {
    backgroundColor: colors.optional,
    borderColor: colors.optional,
  },
  requiredButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  requiredButtonTextActive: {
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: colors.border,
  },
  cancelModalButtonText: {
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

