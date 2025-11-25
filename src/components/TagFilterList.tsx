import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { colors } from '../constants';
import * as SQLite from 'expo-sqlite';
import { getAllTags } from '../database/operations';

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
}

export const TagFilterList: React.FC<Props> = ({ value, onChange }) => {
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>태그 선택 ({allTags.length}개)</Text>
      {allTags.length === 0 ? (
        <Text style={styles.emptyText}>등록된 태그가 없습니다</Text>
      ) : (
        <FlatList
          data={allTags}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => handleToggle(item)}
            >
              <Text style={styles.itemText}>#{item}</Text>
              <View
                style={[
                  styles.checkbox,
                  value.includes(item) && styles.checkboxChecked,
                ]}
              >
                {value.includes(item) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          style={styles.list}
          nestedScrollEnabled={true}
        />
      )}
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
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

