import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { MainTabParamList } from './types';
import {
  RecipeListScreen,
  CartScreen,
  RecommendationScreen,
} from '../screens';
import { colors } from '../constants';

const Tab = createMaterialTopTabNavigator<MainTabParamList>();

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        tabBarIndicatorStyle: {
          backgroundColor: colors.primary,
          height: 3,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
          textTransform: 'none',
        },
        tabBarPressColor: colors.primary + '20',
        swipeEnabled: true,
      }}
    >
      <Tab.Screen
        name="RecipeList"
        component={RecipeListScreen}
        options={{
          title: '요리',
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: '장바구니',
        }}
      />
      <Tab.Screen
        name="Recommendation"
        component={RecommendationScreen}
        options={{
          title: '추천',
        }}
      />
    </Tab.Navigator>
  );
};

