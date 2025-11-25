import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import { CartItemGroup } from '../types';
import { getCartItemsGrouped, clearCart, removeCartItemsByRecipe, addToCart } from '../database/operations';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItemGroup[]>([]);
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

  const loadCart = async () => {
    if (!db) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getCartItemsGrouped(db);
      setCartItems(data);
    } catch (err) {
      setError('장바구니를 불러오는데 실패했습니다');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [db]);

  const addRecipeToCart = async (recipeId: number, servings: number): Promise<boolean> => {
    if (!db) return false;

    try {
      setLoading(true);
      await addToCart(db, recipeId, servings);
      await loadCart();
      return true;
    } catch (err) {
      setError('장바구니에 추가하는데 실패했습니다');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearAllCart = async () => {
    if (!db) return;

    try {
      await clearCart(db);
      await loadCart();
    } catch (err) {
      setError('장바구니 비우기에 실패했습니다');
      console.error(err);
    }
  };

  const removeRecipeFromCart = async (recipeId: number) => {
    if (!db) return;

    try {
      await removeCartItemsByRecipe(db, recipeId);
      await loadCart();
    } catch (err) {
      setError('항목 삭제에 실패했습니다');
      console.error(err);
    }
  };

  const refresh = () => {
    loadCart();
  };

  return {
    cartItems,
    loading,
    error,
    addRecipeToCart,
    clearAllCart,
    removeRecipeFromCart,
    refresh,
  };
};
