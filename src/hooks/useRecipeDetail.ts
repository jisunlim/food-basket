import { useState, useEffect, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import { RecipeDetail } from '../types';
import { getRecipeById } from '../database/operations';

export const useRecipeDetail = (recipeId: number) => {
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
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

  const loadRecipe = useCallback(async () => {
    if (!db) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getRecipeById(db, recipeId);
      if (data) {
        setRecipe(data);
      } else {
        setError('요리를 찾을 수 없습니다');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '요리 정보를 불러오는데 실패했습니다';
      setError(errorMessage);
      console.error('요리 정보 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [db, recipeId]);

  useEffect(() => {
    loadRecipe();
  }, [loadRecipe]);

  const refresh = useCallback(() => {
    loadRecipe();
  }, [loadRecipe]);

  return {
    recipe,
    loading,
    error,
    refresh,
  };
};

