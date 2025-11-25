import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import {
  RecipeListScreen,
  CartScreen,
  RecommendationScreen,
} from '../screens';
import { colors } from '../constants';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="RecipeList"
        component={RecipeListScreen}
        options={{
          title: '요리 목록',
          tabBarLabel: '요리',
          tabBarIcon: ({ color, size }) => (
            // TODO: 아이콘 라이브러리 추가 후 변경
            <></>
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: '장바구니',
          tabBarLabel: '장바구니',
          tabBarIcon: ({ color, size }) => (
            // TODO: 아이콘 라이브러리 추가 후 변경
            <></>
          ),
        }}
      />
      <Tab.Screen
        name="Recommendation"
        component={RecommendationScreen}
        options={{
          title: '추천 요리',
          tabBarLabel: '추천',
          tabBarIcon: ({ color, size }) => (
            // TODO: 아이콘 라이브러리 추가 후 변경
            <></>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

