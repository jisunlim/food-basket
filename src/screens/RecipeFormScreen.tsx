import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../constants';
import { useRecipeDetail } from '../hooks/useRecipeDetail';
import { IngredientInput } from '../components/IngredientInput';
import { TagInput } from '../components/TagInput';
import * as SQLite from 'expo-sqlite';
import { createRecipe, updateRecipe } from '../database/operations';

type RecipeFormScreenRouteProp = RouteProp<RootStackParamList, 'RecipeForm'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

interface Props {
  route: RecipeFormScreenRouteProp;
}

export const RecipeFormScreen: React.FC<Props> = ({ route }) => {
  const { recipeId } = route.params;
  const isEdit = !!recipeId;
  const navigation = useNavigation<NavigationProp>();
  const { recipe, loading: loadingRecipe } = useRecipeDetail(recipeId || 0);

  const [name, setName] = useState('');
  const [servings, setServings] = useState('2');
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState<
    { ingredientId: number; amount: number; isRequired: boolean }[]
  >([]);
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (recipe && isEdit) {
      setName(recipe.name);
      setServings(recipe.servings.toString());
      setInstructions(recipe.instructions || '');
      setIngredients(
        recipe.ingredients.map((i) => ({
          ingredientId: i.ingredientId,
          amount: i.amount,
          isRequired: i.isRequired,
        }))
      );
      setTags(recipe.tags.map((t) => t.tag));
    }
  }, [recipe, isEdit]);

  const handleSave = async () => {
    // 유효성 검사
    if (!name.trim()) {
      Alert.alert('오류', '요리 이름을 입력해주세요');
      return;
    }

    const servingsNum = parseInt(servings);
    if (isNaN(servingsNum) || servingsNum <= 0) {
      Alert.alert('오류', '올바른 인분을 입력해주세요');
      return;
    }

    if (ingredients.length === 0) {
      Alert.alert('오류', '최소 1개 이상의 재료를 추가해주세요');
      return;
    }

    const hasRequired = ingredients.some((i) => i.isRequired);
    if (!hasRequired) {
      Alert.alert('오류', '최소 1개 이상의 필수 재료가 필요합니다');
      return;
    }

    try {
      setSaving(true);
      const db = await SQLite.openDatabaseAsync('foodbasket.db');

      if (isEdit && recipeId) {
        await updateRecipe(db, recipeId, {
          name: name.trim(),
          servings: servingsNum,
          instructions: instructions.trim(),
          ingredients,
          tags,
        });
        Alert.alert('성공', '요리가 수정되었습니다', [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        const newId = await createRecipe(db, {
          name: name.trim(),
          servings: servingsNum,
          instructions: instructions.trim(),
          ingredients,
          tags,
        });
        Alert.alert('성공', '요리가 등록되었습니다', [
          {
            text: '확인',
            onPress: () => {
              navigation.goBack();
              navigation.navigate('RecipeDetail', { recipeId: newId });
            },
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  if (loadingRecipe && isEdit) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>요리 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.label}>요리 이름 *</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 김치찌개"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>기본 인분 *</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 2"
            value={servings}
            onChangeText={setServings}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>재료 *</Text>
          <IngredientInput value={ingredients} onChange={setIngredients} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>태그</Text>
          <TagInput value={tags} onChange={setTags} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>요리 과정</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="요리 과정을 입력하세요..."
            value={instructions}
            onChangeText={setInstructions}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEdit ? '수정' : '등록'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.surface,
  },
  textArea: {
    minHeight: 120,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
});

