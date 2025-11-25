import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { RecipeListScreen, CartScreen, RecipeDetailScreen, RecipeFormScreen } from '../screens';
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
          name="Home"
          component={RecipeListScreen}
          options={{ 
            title: '오늘 뭐 해먹을까요?',
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ title: '장바구니' }}
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

