import { useState, useEffect, useCallback } from 'react';
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
        const errorMessage = err instanceof Error ? err.message : '데이터베이스 연결 실패';
        setError(errorMessage);
        console.error('DB 연결 실패:', err);
      }
    };

    initDb();
  }, []);

  const loadRecommendations = useCallback(async () => {
    if (!db) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getRecommendations(db);
      setRecommendations(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '추천 요리를 불러오는데 실패했습니다';
      setError(errorMessage);
      console.error('추천 요리 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const refresh = useCallback(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  return {
    recommendations,
    loading,
    error,
    refresh,
  };
};

