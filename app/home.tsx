import { RouteProp } from '@react-navigation/native';
import axios from 'axios';
import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

// Habilitar LayoutAnimation no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Cliente {
  CODIGO: string;
  RAZAOSOC: string;
  ENDERECO: string;
  CIDADE: string;
  CONTATO: string;
}

type RootStackParamList = {
  Home: { user: { ID: string; NOME: string; PASSWORD: string } };
};

type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  route: HomeScreenRouteProp;
  navigation: any;
}

// Componente separado para o card (com React.memo)
const ClienteCard: React.FC<{
  item: Cliente;
  onPriceTablePress: (codigo: string) => void;
}> = memo(({ item, onPriceTablePress }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleCard = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={toggleCard}
    >
      <Text style={styles.cardTitle}>{item.CODIGO} - {item.RAZAOSOC}</Text>
      {isExpanded && (
        <View>
          <Text style={styles.cardText}>Endereço: {item.ENDERECO}</Text>
          <Text style={styles.cardText}>Cidade: {item.CIDADE}</Text>
          <Text style={styles.cardText}>Contato: {item.CONTATO}</Text>
          <TouchableOpacity
            style={styles.priceTableButton}
            onPress={() => onPriceTablePress(item.CODIGO)}
          >
            <Text style={styles.priceTableButtonText}>Tabela de Preço</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
});

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>(''); // Estado para o valor digitado no campo
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const { user } = route.params;

  const fetchClientes = useCallback(async (pageNumber: number, query: string = '') => {
    if (isFetching || !hasMore) return;
    setIsFetching(true);
    setLoading(true);

    try {
      console.log('Fazendo requisição com:', { page: pageNumber, search: query }); // Debug: Verifica os parâmetros da requisição
      const response = await axios.get('http://192.168.2.133:3000/clients', {
        params: {
          id: 19,
          page: pageNumber,
          search: query,
        },
      });

      console.log('Resposta da API:', response.data); // Debug: Verifica a resposta da API

      if (response.status === 200 && response.data.user) {
        const { clientes: newClientes, hasMore: more } = response.data.user;

        if (pageNumber === 1) {
          setClientes(newClientes); // Atualiza a lista de clientes
        } else {
          setClientes(prev => [...prev, ...newClientes]); // Adiciona novos clientes
        }

        setHasMore(more);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [isFetching, hasMore]);

  useEffect(() => {
    console.log('useEffect acionado com searchQuery:', searchQuery); // Debug: Verifica se o useEffect está sendo acionado
    fetchClientes(page, searchQuery);
  }, [page, searchQuery]); // Só executa quando `page` ou `searchQuery` mudam

  const handleLoadMore = () => {
    if (!loading && hasMore && !isFetching) {
      setPage(prev => prev + 1); // Incrementa a página corretamente
    }
  };

  const handleSearch = () => {
    console.log('Texto da busca (ao pressionar a lupa):', inputValue); // Debug: Verifica o texto digitado
    setSearchQuery(inputValue); // Atualiza o estado searchQuery com o valor digitado
    setPage(1); // Reseta a página para 1 ao fazer uma nova pesquisa
    setInputValue(''); // Limpa o campo de busca após a pesquisa
  };

  const handleLogout = () => {
    navigation.navigate('Login');
  };

  const handlePriceTable = useCallback((codigo: string) => {
    navigation.navigate('Products', { clienteCodigo: codigo });
  }, []);

  const renderItem = useCallback(({ item }: { item: Cliente }) => (
    <ClienteCard
      item={item}
      onPriceTablePress={handlePriceTable}
    />
  ), [handlePriceTable]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Olá, {user?.NOME || 'Usuário'}!</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar cliente..."
          value={inputValue}
          onChangeText={setInputValue} // Atualiza o estado inputValue
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Icon name="search" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={clientes}
        renderItem={renderItem}
        keyExtractor={(item) => item.CODIGO}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        ListFooterComponent={loading ? <ActivityIndicator size="large" color="#6200ee" /> : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButtonText: {
    color: '#6200ee',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 15,
  },
  searchButton: {
    marginLeft: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  priceTableButton: {
    backgroundColor: '#2276f5',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  priceTableButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;