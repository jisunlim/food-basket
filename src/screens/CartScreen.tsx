import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants';

export const CartScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>장바구니</Text>
      <Text style={styles.subtitle}>곧 구현될 예정입니다</Text>
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
    fontSize: 14,
    color: colors.textSecondary,
  },
});

