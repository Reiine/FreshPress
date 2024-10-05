import React, {useState,useEffect} from 'react';
import {StyleSheet} from 'react-native';
import Navigation from './components/Navigation';
import SystemNavigationBar from 'react-native-system-navigation-bar';

export default function App() {

  SystemNavigationBar.stickyImmersive();

  return <Navigation />;
}

const styles = StyleSheet.create({});
