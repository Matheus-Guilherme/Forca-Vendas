import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../login';
import HomeScreen from '../home';
import ProductsScreen from '../products';

// Defina os tipos das rotas
type RootStackParamList = {
  Login: undefined;
  Home: { user: { ID: string; NOME: string; PASSWORD: string; } };
  Products: undefined;
};

// Cria o navegador em pilha
const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Products" component={ProductsScreen}/>
    </Stack.Navigator>
  );
};

export default App;