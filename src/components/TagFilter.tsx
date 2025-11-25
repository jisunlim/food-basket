import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';
import { colors } from '../constants';
import * as SQLite from 'expo-sqlite';
import { getAllTags } from '../database/operations';

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
}

export const TagFilter: React.FC<Props> = ({ value, onChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const db = await SQLite.openDatabaseAsync('foodbasket.db');
        const tags = await getAllTags(db);
        setAllTags(tags);
      } catch (error) {
        console.error('태그 로딩 실패:', error);
      }
    };

    loadTags();
  }, []);

  const handleToggle = (tag: string) => {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else {
      onChange([...value, tag]);
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.filterButtonText}>
          🏷️ 태그 필터 {value.length > 0 && `(${value.length})`}
        </Text>
      </TouchableOpacity>

      {value.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.selectedContainer}
        >
          {value.map((tag) => (
            <View key={tag} style={styles.selectedChip}>
              <Text style={styles.selectedChipText}>#{tag}</Text>
              <TouchableOpacity
                onPress={() => handleToggle(tag)}
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
              <Text style={styles.modalTitle}>태그 선택</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={allTags}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = value.includes(item);
                return (
                  <TouchableOpacity
                    style={[
                      styles.tagItem,
                      isSelected && styles.tagItemSelected,
                    ]}
                    onPress={() => handleToggle(item)}
                  >
                    <Text
                      style={[
                        styles.tagName,
                        isSelected && styles.tagNameSelected,
                      ]}
                    >
                      #{item}
                    </Text>
                    {isSelected && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  등록된 태그가 없습니다
                </Text>
              }
              contentContainerStyle={
                allTags.length === 0 ? styles.emptyContainer : undefined
              }
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
  tagItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  tagItemSelected: {
    backgroundColor: colors.primaryLight + '30',
  },
  tagName: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  tagNameSelected: {
    fontWeight: '600',
    color: colors.primaryDark,
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});

