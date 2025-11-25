import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { RecipeDetailScreen, RecipeFormScreen } from '../screens';
import { colors } from '../constants';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RecipeDetail"
          component={RecipeDetailScreen}
          options={{ title: '요리 상세' }}
        />
        <Stack.Screen
          name="RecipeForm"
          component={RecipeFormScreen}
          options={({ route }) => ({
            title: route.params?.recipeId ? '요리 수정' : '요리 등록',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

