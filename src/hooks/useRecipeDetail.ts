import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import { RecipeDetail } from '../types';
import { getRecipeById } from '../database/operations';

export const useRecipeDetail = (recipeId: string) => {
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
        setError('데이터베이스 연결 실패');
        console.error(err);
      }
    };

    initDb();
  }, []);

  const loadRecipe = async () => {
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
      setError('요리 정보를 불러오는데 실패했습니다');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipe();
  }, [db, recipeId]);

  return {
    recipe,
    loading,
    error,
    refresh: loadRecipe,
  };
};

