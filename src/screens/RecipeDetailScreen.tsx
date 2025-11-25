import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../constants';

type RecipeDetailScreenRouteProp = RouteProp<RootStackParamList, 'RecipeDetail'>;

interface Props {
  route: RecipeDetailScreenRouteProp;
}

export const RecipeDetailScreen: React.FC<Props> = ({ route }) => {
  const { recipeId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>요리 상세</Text>
      <Text style={styles.subtitle}>Recipe ID: {recipeId}</Text>
      <Text style={styles.info}>곧 구현될 예정입니다</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: colors.textDisabled,
  },
});

