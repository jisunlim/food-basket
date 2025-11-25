import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import { Ingredient } from '../types';
import { getIngredients, createIngredient } from '../database/operations';

export const useIngredients = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
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

  const loadIngredients = async () => {
    if (!db) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getIngredients(db);
      setIngredients(data);
    } catch (err) {
      setError('재료 목록을 불러오는데 실패했습니다');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, [db]);

  const addIngredient = async (name: string, unit: string) => {
    if (!db) return null;

    try {
      const id = await createIngredient(db, { name, unit });
      await loadIngredients();
      return id;
    } catch (err) {
      setError('재료 추가에 실패했습니다');
      console.error(err);
      return null;
    }
  };

  const searchIngredients = (query: string): Ingredient[] => {
    if (!query.trim()) return ingredients;
    
    const lowerQuery = query.toLowerCase();
    return ingredients.filter((ingredient) =>
      ingredient.name.toLowerCase().includes(lowerQuery)
    );
  };

  return {
    ingredients,
    loading,
    error,
    addIngredient,
    searchIngredients,
    refresh: loadIngredients,
  };
};

