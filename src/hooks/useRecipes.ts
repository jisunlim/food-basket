import { useState, useEffect, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import { Recipe } from '../types';
import { getRecipes, deleteRecipe, updateRecipe } from '../database/operations';

export const useRecipes = (filters?: {
  tag?: string;
  ingredientId?: string;
  isFavorite?: boolean;
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  useEffect(() => {
    const initDb = async () => {
      try {
        const database = await SQLite.openDatabaseAsync('foodbasket.db');
        setDb(database);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '데이터베이스 연결 실패';
        setError(errorMessage);
        console.error('DB 연결 실패:', err);
      }
    };

    initDb();
  }, []);

  const loadRecipes = useCallback(async () => {
    if (!db) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getRecipes(db, filters);
      setRecipes(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '요리 목록을 불러오는데 실패했습니다';
      setError(errorMessage);
      console.error('요리 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [db, filters?.tag, filters?.ingredientId, filters?.isFavorite]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const toggleFavorite = async (recipeId: number, currentFavorite: boolean) => {
    if (!db) return;

    try {
      await updateRecipe(db, recipeId, { isFavorite: !currentFavorite });
      await loadRecipes();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '즐겨찾기 변경에 실패했습니다';
      setError(errorMessage);
      console.error('즐겨찾기 변경 실패:', err);
    }
  };

  const removeRecipe = async (recipeId: number) => {
    if (!db) return;

    try {
      await deleteRecipe(db, recipeId);
      await loadRecipes();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '요리 삭제에 실패했습니다';
      setError(errorMessage);
      console.error('요리 삭제 실패:', err);
    }
  };

  const refresh = useCallback(() => {
    loadRecipes();
  }, [loadRecipes]);

  return {
    recipes,
    loading,
    error,
    toggleFavorite,
    removeRecipe,
    refresh,
  };
};

