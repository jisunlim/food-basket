import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors } from '../constants';
import { IngredientFilterList } from './IngredientFilterList';
import { TagFilterList } from './TagFilterList';

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedIngredients: number[];
  selectedTags: string[];
  onIngredientsChange: (value: number[]) => void;
  onTagsChange: (value: string[]) => void;
  onClearAll: () => void;
}

export const FilterModal: React.FC<Props> = ({
  visible,
  onClose,
  selectedIngredients,
  selectedTags,
  onIngredientsChange,
  onTagsChange,
  onClearAll,
}) => {
  const hasFilters = selectedIngredients.length > 0 || selectedTags.length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>필터</Text>
            <View style={styles.headerButtons}>
              {hasFilters && (
                <TouchableOpacity onPress={onClearAll} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>전체 해제</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.section}>
              <IngredientFilterList
                value={selectedIngredients}
                onChange={onIngredientsChange}
              />
            </View>

            <View style={styles.section}>
              <TagFilterList
                value={selectedTags}
                onChange={onTagsChange}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyButton} onPress={onClose}>
              <Text style={styles.applyButtonText}>적용</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.error + '20',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  closeButton: {
    fontSize: 28,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    flex: 1,
    paddingVertical: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

