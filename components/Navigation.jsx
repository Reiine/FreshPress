import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {Icon, Provider, DefaultTheme} from 'react-native-paper';
import Home from './Home';
import ViewData from './ViewData';
import Edit from './Edit';
const Tab = createMaterialBottomTabNavigator();

function CustomTabBarIcon({route, focused}) {
  let iconName;
  if (route.name === 'Home') {
    iconName = 'home';
  } else if (route.name === 'ViewData') {
    iconName = 'file-document';
  } else if (route.name === 'Edit') {
    iconName = 'pencil';
  }

  return (
    <Icon
      source={focused ? iconName : iconName + '-outline'}
      color={'black'}
      size={28}
    />
  );
}

export default function Navigation() {
  const [focusedRoute, setFocusedRoute] = useState('Home');
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const getTabBarColor = routeName => {
    const col = '#67d991';

    return col; // Default color
  };

  // const lightTheme = {
  //   ...DefaultTheme,
  //   dark: false, // Ensure the theme is not dark
  //   colors: {
  //     ...DefaultTheme.colors,
  //     secondaryContainer:"pink"
  //   },
  // };
  // const theme = lightTheme;

  return (
    <Provider  > 
      <NavigationContainer>
        <Tab.Navigator
          barStyle={{backgroundColor: getTabBarColor(focusedRoute), height: 60}}
          initialRouteName="Home"
          shifting={false}
          screenOptions={({route}) => ({
            tabBarIcon: ({focused}) => (
              <CustomTabBarIcon route={route} focused={focused} />
            ),
            tabBarLabel: '', 
          })}
          screenListeners={{
            state: e => {
              const currentRoute = e.data.state.routes[e.data.state.index].name;
              setFocusedRoute(currentRoute);
            },
          }}>
          <Tab.Screen
            name="Home"
            component={Home}
            initialParams={{month, setMonth}}
            options={{
              getColor: 'pink',
            }}
          />
          <Tab.Screen
            name="ViewData"
            children={() => <ViewData month={month} />}
          />
          <Tab.Screen
            name="Edit"
            component={Edit}
            initialParams={{month, setMonth}}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({});
