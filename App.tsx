import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { initializeDatabase, seedDatabase } from './src/database/schema';
import * as SQLite from 'expo-sqlite';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  useEffect(() => {
    const setup = async () => {
      try {
        const database = await initializeDatabase();
        
        // 개발 모드에서만 샘플 데이터 추가 (첫 실행 시)
        await seedDatabase(database);
        
        setDb(database);
        setIsReady(true);
      } catch (error) {
        console.error('데이터베이스 초기화 오류:', error);
      }
    };

    setup();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>앱을 시작하는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 FoodBasket</Text>
      <Text style={styles.subtitle}>요리로부터 식재료 목록 추출</Text>
      <Text style={styles.info}>데이터베이스 초기화 완료!</Text>
      <Text style={styles.hint}>
        화면 구현을 시작하려면{'\n'}
        src/screens/ 디렉토리를 확인하세요.
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    color: '#2196F3',
    marginBottom: 20,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
});
