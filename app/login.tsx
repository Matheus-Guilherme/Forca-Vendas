import React, { useState } from 'react';
import { StackNavigationProp} from '@react-navigation/stack';
//import { RootStackParamList } from './(tabs)/index'; 
import { StyleSheet, View, Text, TextInput, Image, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

type RootStackParamList = {
    Login: undefined;
    Home: { user: { ID: string; NOME: string; PASSWORD: string } };
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
    navigation: LoginScreenNavigationProp;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
    
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    
    async function handleLogin() {
        try {
            const response = await axios.post('http://192.168.2.133:3000/login', {
                cpf: '1',
                password: 'ecapp'
            });
            console.log(response.data);

            // Verifica a resposta do backend
            if (response.data.success) {
                // Login bem-sucedido, redireciona para a tela Home
                navigation.navigate('Home',  { user: response.data.user });
                console.log('Login bem-sucedido!');
            } else {
                // Exibe uma mensagem de erro
                Alert.alert('Erro', response.data.message);
                console.log(response.data);
            }
        } catch (error) {
            // Trata erros de rede ou do servidor
            Alert.alert('Erro', 'Ocorreu um erro ao tentar fazer login.');
            console.error(error);
        }
    }

    // Função para formatar o CPF
    const formatCPF = (input: string) => {
      // Remove tudo que não for dígito
      const numericValue = input.replace(/\D/g, '');
    
      // Limita o número de caracteres a 11
      const truncatedValue = numericValue.slice(0, 11);
    
      // Aplica a máscara
      let formattedValue = truncatedValue;
      if (truncatedValue.length > 3) {
        formattedValue = `${truncatedValue.slice(0, 3)}.${truncatedValue.slice(3)}`;
      }
      if (truncatedValue.length > 6) {
        formattedValue = `${formattedValue.slice(0, 7)}.${formattedValue.slice(7)}`;
      }
      if (truncatedValue.length > 9) {
        formattedValue = `${formattedValue.slice(0, 11)}-${formattedValue.slice(11)}`;
      }
    
      return formattedValue;
    };

     // Função chamada quando o texto muda
    const handleChangeText = (text: string) => {
        const formattedText = formatCPF(text);
        setCpf(formattedText);
    };

    return (
        <View style={styles.container}>
            {/* Imagem Central */}
            <Image
                source={require('C:/Users/tieca/OneDrive/Documentos/forca-ecapp/assets/images/logo-ecapp.png')}
                style={styles.logo}
            />

            {/* Campo de CPF com Máscara */}
            <View style={styles.inputContainer}>
                <MaterialIcons name="person" size={24} color="#666" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="CPF"
                    onChangeText={handleChangeText}
                    placeholderTextColor="#666"
                    value={cpf}
                    maxLength={14}
                    keyboardType="numeric"
                />
            </View>

            {/* Campo de Senha */}
            <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={24} color="#666" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Senha"
                    placeholderTextColor="#666"
                    secureTextEntry
                />
            </View>

            {/* Botão de Login */}
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 40,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 20,
        width: '100%',
        elevation: 3, // Sombra no Android
        shadowColor: '#000', // Sombra no iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#333',
    },
    button: {
        backgroundColor: '#2276f5',
        borderRadius: 10,
        paddingVertical: 15,
        width: '100%',
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default LoginScreen;