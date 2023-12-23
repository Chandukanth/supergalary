import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SuperGalary from "./src/views";
import { RecoilRoot } from 'recoil';
import { init } from "./src/database/db";
import { navigationRef } from "./src/lib/RootNavigation";
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from "react-native";
const Stack = createNativeStackNavigator();

const App = () => {
  StatusBar.setBackgroundColor("#fff")
  StatusBar.setBarStyle("dark-content")
  React.useEffect(() => {
    init()
      .then(() => {
        console.log('Database initialized.');
      })
      .catch((error) => {
        console.error('Error initializing database.', error);
      });
  }, []);
  return (
    <NavigationContainer ref={navigationRef}>
      <RecoilRoot>

        <PaperProvider>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
            initialRouteName={'SuperGalary'}
          >
            {/* Login */}
            <Stack.Screen name="SuperGalary" component={SuperGalary} />

          </Stack.Navigator>
        </PaperProvider>
      </RecoilRoot>

    </NavigationContainer>
  )
}
export default App