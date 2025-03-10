import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker'; // Para os selects
import axios from 'axios';

interface Product {
  CODIGO: string;
  DESCRICAO: string;
  UNIDADE: string;
  FAMILIA: string;
  ESTOQUE: string;
  PRECO: string;
}

interface ProductsScreenProps {
  route: any; // Para receber o código do cliente
  navigation: any;
}

const ProductsScreen: React.FC<ProductsScreenProps> = ({ route, navigation }) => {
  const { clienteCodigo } = route.params; // Recebe o código do cliente da tela Home

  const [produtos, setProdutos] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [formaPagamento, setFormaPagamento] = useState<string>('');
  const [condicaoPagamento, setCondicaoPagamento] = useState<string>('');

  // Dados fictícios para formas e condições de pagamento
  const formasPagamento = ['À Vista', 'Cartão de Crédito', 'Boleto', 'PIX'];
  const condicoesPagamento = ['7 Dias', '14 Dias', '21 Dias', '30 Dias'];

  // Função para buscar produtos
  const fetchProdutos = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://192.168.2.133:3000/products', {
        params: {
          clienteCodigo,
          search: searchQuery,
        },
      });

      if (response.status === 200) {
        setProdutos(response.data);
      } else {
        throw new Error('Erro ao buscar produtos');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, [searchQuery]);

  // Renderiza cada item da lista de produtos
  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.CODIGO} - {item.DESCRICAO}</Text>
      <Text style={styles.cardText}>{item.UNIDADE} - {item.FAMILIA}</Text>
      <Text style={styles.cardText}>Estoque: {item.ESTOQUE}</Text>
      <Text style={styles.cardText}>Valor: R$ {item.PRECO}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho com selects */}
      <View style={styles.header}>
        <View style={styles.selectContainer}>
          <Text style={styles.label}>Forma de Pagamento</Text>
          <Picker
            selectedValue={formaPagamento}
            onValueChange={(itemValue) => setFormaPagamento(itemValue)}
            style={styles.picker}
          >
            {formasPagamento.map((forma, index) => (
              <Picker.Item key={index} label={forma} value={forma} />
            ))}
          </Picker>
        </View>

        <View style={styles.selectContainer}>
          <Text style={styles.label}>Condição de Pagamento</Text>
          <Picker
            selectedValue={condicaoPagamento}
            onValueChange={(itemValue) => setCondicaoPagamento(itemValue)}
            style={styles.picker}
          >
            {condicoesPagamento.map((condicao, index) => (
              <Picker.Item key={index} label={condicao} value={condicao} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Campo de pesquisa */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar produto..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Lista de produtos */}
      <FlatList
        data={produtos}
        renderItem={renderItem}
        keyExtractor={(item) => item.CODIGO}
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
    marginBottom: 20,
  },
  selectContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 15,
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
});

export default ProductsScreen;