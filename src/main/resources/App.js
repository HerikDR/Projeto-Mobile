import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import ProcessoFormScreen from './src/screens/ProcessoFormScreen';
import ProcessoDetalhesScreen from './src/screens/ProcessoDetalhesScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#3498db',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: 'Gerenciamento de Processos' }}
                />
                <Stack.Screen
                    name="ProcessoForm"
                    component={ProcessoFormScreen}
                    options={{ title: 'Processo' }}
                />
                <Stack.Screen
                    name="ProcessoDetalhes"
                    component={ProcessoDetalhesScreen}
                    options={{ title: 'Detalhes do Processo' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

// ==================== src/services/api.js ====================
import axios from 'axios';

// IMPORTANTE: Substitua pelo IP da sua máquina na rede local
// Para encontrar seu IP: ipconfig (Windows) ou ifconfig (Mac/Linux)
const API_URL = 'http://SEU_IP_AQUI:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error('Erro na resposta:', error.response.data);
        } else if (error.request) {
            console.error('Erro na requisição:', error.request);
        } else {
            console.error('Erro:', error.message);
        }
        return Promise.reject(error);
    }
);

export const processoService = {
    // Listar todos os processos
    listarTodos: async () => {
        const response = await api.get('/processos');
        return response.data;
    },

    // Buscar processo por ID
    buscarPorId: async (id) => {
        const response = await api.get(`/processos/${id}`);
        return response.data;
    },

    // Criar novo processo
    criar: async (processo) => {
        const response = await api.post('/processos', processo);
        return response.data;
    },

    // Atualizar processo
    atualizar: async (id, processo) => {
        const response = await api.put(`/processos/${id}`, processo);
        return response.data;
    },

    // Deletar processo
    deletar: async (id) => {
        const response = await api.delete(`/processos/${id}`);
        return response.data;
    },

    // Pesquisar por título
    pesquisarPorTitulo: async (titulo) => {
        const response = await api.get(`/processos/pesquisar?titulo=${titulo}`);
        return response.data;
    },

    // Buscar por termo
    buscarPorTermo: async (termo) => {
        const response = await api.get(`/processos/buscar?termo=${termo}`);
        return response.data;
    },

    // Atualizar status de sub-passo
    atualizarStatusSubPasso: async (processoId, subPassoId, concluido) => {
        const response = await api.patch(
            `/processos/${processoId}/subpassos/${subPassoId}?concluido=${concluido}`
        );
        return response.data;
    },
};

export default api;

// ==================== src/screens/HomeScreen.js ====================
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Alert,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { processoService } from '../services/api';
import ProcessoItem from '../components/ProcessoItem';

export default function HomeScreen({ navigation }) {
    const [processos, setProcessos] = useState([]);
    const [processosExibidos, setProcessosExibidos] = useState([]);
    const [pesquisa, setPesquisa] = useState('');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        carregarProcessos();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            carregarProcessos();
        });
        return unsubscribe;
    }, [navigation]);

    const carregarProcessos = async () => {
        setLoading(true);
        try {
            const response = await processoService.listarTodos();
            if (response.sucesso) {
                setProcessos(response.dados);
                setProcessosExibidos(response.dados);
            } else {
                Alert.alert('Erro', response.mensagem);
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar os processos. Verifique a conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await carregarProcessos();
        setRefreshing(false);
    }, []);

    const handlePesquisa = (texto) => {
        setPesquisa(texto);
        if (texto.trim() === '') {
            setProcessosExibidos(processos);
        } else {
            const filtrados = processos.filter(
                (processo) =>
                    processo.titulo.toLowerCase().includes(texto.toLowerCase()) ||
                    (processo.descricao && processo.descricao.toLowerCase().includes(texto.toLowerCase()))
            );
            setProcessosExibidos(filtrados);
        }
    };

    const handleDeletar = async (id) => {
        Alert.alert(
            'Confirmar Exclusão',
            'Tem certeza que deseja excluir este processo?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await processoService.deletar(id);
                            if (response.sucesso) {
                                Alert.alert('Sucesso', response.mensagem);
                                carregarProcessos();
                            } else {
                                Alert.alert('Erro', response.mensagem);
                            }
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir o processo.');
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }) => (
        <ProcessoItem
            processo={item}
            onPress={() => navigation.navigate('ProcessoDetalhes', { processoId: item.id })}
            onEdit={() => navigation.navigate('ProcessoForm', { processoId: item.id })}
            onDelete={() => handleDeletar(item.id)}
        />
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Pesquisar por título ou descrição..."
                    value={pesquisa}
                    onChangeText={handlePesquisa}
                />
            </View>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('ProcessoForm')}
            >
                <Text style={styles.addButtonText}>+ Adicionar Processo</Text>
            </TouchableOpacity>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3498db" />
                    <Text style={styles.loadingText}>Carregando...</Text>
                </View>
            ) : (
                <FlatList
                    data={processosExibidos}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Nenhum processo encontrado</Text>
                        </View>
                    }
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    searchContainer: {
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    searchInput: {
        height: 45,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    addButton: {
        backgroundColor: '#27ae60',
        margin: 15,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    listContainer: {
        padding: 15,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        padding: 30,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
});