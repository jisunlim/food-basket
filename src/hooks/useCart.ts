import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import { addToCart } from '../database/operations';

export const useCart = () => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const addRecipeToCart = async (recipeId: string, servings: number) => {
    if (!db) {
      setError('데이터베이스가 준비되지 않았습니다');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      await addToCart(db, recipeId, servings);
      return true;
    } catch (err) {
      setError('장바구니에 추가하는데 실패했습니다');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    addRecipeToCart,
    loading,
    error,
  };
};

