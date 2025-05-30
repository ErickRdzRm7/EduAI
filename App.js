import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <WebView
      source={{ uri: ' http://192.168.1.67:9002' }}
      style={{ flex: 1 }}
    />
  );
}
 