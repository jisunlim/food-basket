import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { RootSiblingParent } from 'react-native-root-siblings';
import { initializeDatabase, seedDatabase } from './src/database/schema';
import { RootNavigator } from './src/navigation/RootNavigator';
import * as SQLite from 'expo-sqlite';
import { colors } from './src/constants';

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
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>앱을 시작하는 중...</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <RootSiblingParent>
      <RootNavigator />
      <StatusBar style="auto" />
    </RootSiblingParent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
