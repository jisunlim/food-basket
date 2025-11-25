import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../constants';

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const ServingStepper: React.FC<Props> = ({
  value,
  onChange,
  min = 1,
  max = 20,
  step = 1,
}) => {
  const handleDecrease = () => {
    const newValue = value - step;
    if (newValue >= min) {
      onChange(newValue);
    }
  };

  const handleIncrease = () => {
    const newValue = value + step;
    if (newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, value <= min && styles.buttonDisabled]}
        onPress={handleDecrease}
        disabled={value <= min}
      >
        <Text style={[styles.buttonText, value <= min && styles.buttonTextDisabled]}>
          −
        </Text>
      </TouchableOpacity>
      
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.unit}>인분</Text>
      </View>
      
      <TouchableOpacity
        style={[styles.button, value >= max && styles.buttonDisabled]}
        onPress={handleIncrease}
        disabled={value >= max}
      >
        <Text style={[styles.buttonText, value >= max && styles.buttonTextDisabled]}>
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.border,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonTextDisabled: {
    color: colors.textDisabled,
  },
  valueContainer: {
    minWidth: 80,
    alignItems: 'center',
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  unit: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

