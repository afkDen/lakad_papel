import React from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DocumentProvider } from '../src/context/DocumentContext';

export default function Layout() {
  return (
    <DocumentProvider>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#ffffff',
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#111827',
          },
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopColor: '#e5e7eb',
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
        }}
      >
        <Tabs.Screen
          name="checklist"
          options={{
            title: 'My Documents',
            tabBarLabel: 'Documents',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="target"
          options={{
            title: 'What do I need?',
            tabBarLabel: 'What do I need?',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="roadmap"
          options={{
            title: 'Roadmap',
            tabBarLabel: 'Roadmap',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarLabel: 'History',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="time-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            href: null, // Hide index from tab bar
          }}
        />
      </Tabs>
    </DocumentProvider>
  );
}
