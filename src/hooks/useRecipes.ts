import { useState, useEffect } from 'react';
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
        setError('데이터베이스 연결 실패');
        console.error(err);
      }
    };

    initDb();
  }, []);

  const loadRecipes = async () => {
    if (!db) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getRecipes(db, filters);
      setRecipes(data);
    } catch (err) {
      setError('요리 목록을 불러오는데 실패했습니다');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, [db, filters?.tag, filters?.ingredientId, filters?.isFavorite]);

  const toggleFavorite = async (recipeId: number, currentFavorite: boolean) => {
    if (!db) return;

    try {
      await updateRecipe(db, recipeId, { isFavorite: !currentFavorite });
      await loadRecipes();
    } catch (err) {
      setError('즐겨찾기 변경에 실패했습니다');
      console.error(err);
    }
  };

  const removeRecipe = async (recipeId: number) => {
    if (!db) return;

    try {
      await deleteRecipe(db, recipeId);
      await loadRecipes();
    } catch (err) {
      setError('요리 삭제에 실패했습니다');
      console.error(err);
    }
  };

  const refresh = () => {
    loadRecipes();
  };

  return {
    recipes,
    loading,
    error,
    toggleFavorite,
    removeRecipe,
    refresh,
  };
};

