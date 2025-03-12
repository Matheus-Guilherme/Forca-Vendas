import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

interface Product {
  CODIGO: string;
  DESCRICAO: string;
  UNIDADE: string;
  FAMILIA: string;
  ESTOQUE: string;
  PRECO: string;
  quantidade?: number; // Quantidade selecionada pelo usuário
  incluido?: boolean; // Indica se o item foi incluído no orçamento
}

interface ProductsScreenProps {
  route: any;
  navigation: any;
}

const ProductsScreen: React.FC<ProductsScreenProps> = ({ route, navigation }) => {
  const { clienteCodigo, clienteNome, clienteTabela} = route.params; // Recebe o nome do cliente da home
  console.log(route.params);

  const [produtos, setProdutos] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [formaPagamento, setFormaPagamento] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [valorTotal, setValorTotal] = useState<number>(0); // Valor total orçado
  const [quantidadeItens, setQuantidadeItens] = useState<number>(0); // Quantidade de itens orçados
  const [modalVisible, setModalVisible] = useState<boolean>(false); // Controla a visibilidade da modal

  const formasPagamento = ['À Vista', 'Cartão de Crédito', 'Boleto'];

  const fetchProdutos = useCallback(async (pageNumber: number, query: string = '') => {
    if (isFetching || !hasMore) return;
    setIsFetching(true);
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://192.168.2.133:3000/products', {
        params: {
          clienteCodigo,
          search: query,
          page: pageNumber,
        },
      });

      if (response.status === 200 && response.data.products.itens) {
        const newProducts = response.data.products.itens;

        if (pageNumber === 1) {
          setProdutos(newProducts);
        } else {
          setProdutos((prev) => [...prev, ...newProducts]);
        }

        setHasMore(newProducts.length === 50);
      } else {
        throw new Error('Erro ao buscar produtos');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setError('Erro ao carregar produtos. Tente novamente.');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [clienteCodigo, isFetching, hasMore]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      fetchProdutos(1, searchQuery);
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleLoadMore = () => {
    if (!loading && hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  // Atualiza a quantidade de um produto
  const handleQuantidadeChange = (codigo: string, quantidade: number) => {
    const novosProdutos = produtos.map((produto) =>
      produto.CODIGO === codigo ? { ...produto, quantidade } : produto
    );
    setProdutos(novosProdutos);
  };

  // Inclui ou remove um item do orçamento
  const handleIncluirItem = (codigo: string) => {
    const novosProdutos = produtos.map((produto) =>
      produto.CODIGO === codigo ? { ...produto, incluido: !produto.incluido } : produto
    );
    setProdutos(novosProdutos);

    // Atualiza o valor total e a quantidade de itens
    const itensIncluidos = novosProdutos.filter((produto) => produto.incluido);
    const total = itensIncluidos.reduce((acc, produto) => {
      const preco = parseFloat(produto.PRECO.replace(',', '.'));
      const quantidade = produto.quantidade || 0;
      return acc + preco * quantidade;
    }, 0);
    setValorTotal(total);
    setQuantidadeItens(itensIncluidos.length);
  };

  // Remove um item do orçamento
  const handleRemoverItem = (codigo: string) => {
    handleIncluirItem(codigo); // Reutiliza a função para remover o item
  };

  // Renderiza cada item da lista de produtos
  const renderItem = ({ item }: { item: Product }) => {
    const precoUnitario = parseFloat(item.PRECO.replace(',', '.'));
    const valorTotalItem = (item.quantidade || 0) * precoUnitario;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.CODIGO} - {item.DESCRICAO}</Text>
        <Text style={styles.cardText}>Familia: {item.FAMILIA}</Text>
        <Text style={styles.cardText}>Unidade: {item.UNIDADE}</Text>
        <Text style={styles.cardText}>Estoque: {item.ESTOQUE} {item.UNIDADE}</Text>
        <Text style={styles.cardText}>Valor Unitário: R$ {item.PRECO}</Text>

        <View style={styles.quantidadeContainer}>
          <Text style={styles.cardText}>Quantidade:</Text>
          <TextInput
            style={styles.quantidadeInput}
            keyboardType="numeric"
            value={item.quantidade?.toString() || ''}
            onChangeText={(text) =>
              handleQuantidadeChange(item.CODIGO, parseInt(text) || 0)
            }
          />
        </View>

        <Text style={styles.cardText}>Valor Total: R$ {valorTotalItem.toFixed(2)}</Text>

        <TouchableOpacity
          style={styles.botaoIncluir}
          onPress={() => handleIncluirItem(item.CODIGO)}
        >
          <Text style={styles.botaoTexto}>
            {item.incluido ? 'Remover do Orçamento' : 'Incluir no Orçamento'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Filtra os itens orçados
  const itensOrcados = produtos.filter((produto) => produto.incluido);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.clienteInfo}>Cliente: {clienteCodigo} - {clienteNome}</Text>
        <Text style={styles.clienteInfo}>
          {clienteTabela ? `Tabela: ${clienteTabela}` : "Tabela Padrão"}
        </Text>

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

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Valor Total Orçado: R$ {valorTotal.toFixed(2)}</Text>
          <Text style={styles.totalText}>Itens Orçados: {quantidadeItens}</Text>
          <TouchableOpacity
            style={styles.botaoModal}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.botaoTexto}>Ver Itens Orçados</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar produto..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={produtos}
        renderItem={renderItem}
        keyExtractor={(item) => item.CODIGO.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color="#6200ee" /> : null
        }
      />

      {/* Modal para exibir os itens orçados */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Itens Orçados</Text>
          <ScrollView>
            {itensOrcados.map((item) => (
              <View key={item.CODIGO} style={styles.modalItem}>
                <Text style={styles.modalText}>Código: {item.CODIGO}</Text>
                <Text style={styles.modalText}>Quantidade: {item.quantidade}</Text>
                <Text style={styles.modalText}>
                  Valor Total: R$ {(item.quantidade! * parseFloat(item.PRECO.replace(',', '.'))).toFixed(2)}
                </Text>
                <TouchableOpacity
                  style={styles.botaoRemover}
                  onPress={() => handleRemoverItem(item.CODIGO)}
                >
                  <Text style={styles.botaoTexto}>Remover</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.botaoFecharModal}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.botaoTexto}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  clienteInfo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
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
  totalContainer: {
    marginTop: 10,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  botaoModal: {
    backgroundColor: '#2276f5',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
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
  quantidadeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  quantidadeInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
    marginLeft: 10,
    width: 60,
  },
  botaoIncluir: {
    backgroundColor: '#2276f5',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  modalItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
  },
  botaoRemover: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  botaoFecharModal: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
});

export default ProductsScreen;