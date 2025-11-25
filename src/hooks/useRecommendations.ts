import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import { RecipeRecommendation } from '../types';
import { getRecommendations } from '../database/operations';

export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState<RecipeRecommendation[]>([]);
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

  const loadRecommendations = async () => {
    if (!db) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getRecommendations(db);
      setRecommendations(data);
    } catch (err) {
      setError('추천 요리를 불러오는데 실패했습니다');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [db]);

  const refresh = () => {
    loadRecommendations();
  };

  return {
    recommendations,
    loading,
    error,
    refresh,
  };
};

