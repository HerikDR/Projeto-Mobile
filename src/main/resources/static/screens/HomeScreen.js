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

// ==================== src/screens/ProcessoFormScreen.js ====================
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { processoService } from '../services/api';

export default function ProcessoFormScreen({ navigation, route }) {
    const { processoId } = route.params || {};
    const isEdicao = !!processoId;

    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [prioridade, setPrioridade] = useState('MEDIA');
    const [dataInicio, setDataInicio] = useState(new Date());
    const [dataTermino, setDataTermino] = useState(new Date());
    const [subPassos, setSubPassos] = useState([]);
    const [novoSubPasso, setNovoSubPasso] = useState('');

    const [showDateInicio, setShowDateInicio] = useState(false);
    const [showDateTermino, setShowDateTermino] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdicao) {
            carregarProcesso();
        }
    }, [processoId]);

    const carregarProcesso = async () => {
        try {
            const response = await processoService.buscarPorId(processoId);
            if (response.sucesso) {
                const processo = response.dados;
                setTitulo(processo.titulo);
                setDescricao(processo.descricao || '');
                setPrioridade(processo.prioridade);
                setDataInicio(new Date(processo.dataInicio));
                setDataTermino(new Date(processo.dataTermino));
                setSubPassos(processo.subPassos || []);
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar o processo.');
        }
    };

    const adicionarSubPasso = () => {
        if (novoSubPasso.trim() === '') {
            Alert.alert('Atenção', 'Digite uma descrição para o sub-passo.');
            return;
        }

        setSubPassos([
            ...subPassos,
            {
                id: null,
                descricao: novoSubPasso,
                concluido: false,
                ordemExibicao: subPassos.length,
            },
        ]);
        setNovoSubPasso('');
    };

    const removerSubPasso = (index) => {
        const novosSubPassos = subPassos.filter((_, i) => i !== index);
        setSubPassos(novosSubPassos);
    };

    const usarDataAtual = () => {
        setDataInicio(new Date());
    };

    const validarFormulario = () => {
        if (!titulo.trim()) {
            Alert.alert('Erro', 'O título é obrigatório.');
            return false;
        }

        if (dataTermino < dataInicio) {
            Alert.alert('Erro', 'A data de término não pode ser anterior à data de início.');
            return false;
        }

        return true;
    };

    const handleSalvar = async () => {
        if (!validarFormulario()) return;

        setLoading(true);
        try {
            const processoData = {
                titulo,
                descricao,
                prioridade,
                dataInicio: dataInicio.toISOString(),
                dataTermino: dataTermino.toISOString(),
                subPassos: subPassos.map((sp, index) => ({
                    ...sp,
                    ordemExibicao: index,
                })),
            };

            let response;
            if (isEdicao) {
                response = await processoService.atualizar(processoId, processoData);
            } else {
                response = await processoService.criar(processoData);
            }

            if (response.sucesso) {
                Alert.alert('Sucesso', response.mensagem, [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else {
                Alert.alert('Erro', response.mensagem);
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar o processo. Verifique os dados e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.label}>Título *</Text>
                <TextInput
                    style={styles.input}
                    value={titulo}
                    onChangeText={setTitulo}
                    placeholder="Digite o título"
                />

                <Text style={styles.label}>Descrição</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={descricao}
                    onChangeText={setDescricao}
                    placeholder="Digite a descrição"
                    multiline
                    numberOfLines={4}
                />

                <Text style={styles.label}>Prioridade *</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={prioridade}
                        onValueChange={setPrioridade}
                        style={styles.picker}
                    >
                        <Picker.Item label="Oscioso" value="OSCIOSO" />
                        <Picker.Item label="Baixa" value="BAIXA" />
                        <Picker.Item label="Média" value="MEDIA" />
                        <Picker.Item label="Alta" value="ALTA" />
                        <Picker.Item label="Urgente" value="URGENTE" />
                    </Picker>
                </View>

                <Text style={styles.label}>Data de Início *</Text>
                <View style={styles.dateContainer}>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowDateInicio(true)}
                    >
                        <Text>{dataInicio.toLocaleString('pt-BR')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.nowButton} onPress={usarDataAtual}>
                        <Text style={styles.nowButtonText}>Agora</Text>
                    </TouchableOpacity>
                </View>

                {showDateInicio && (
                    <DateTimePicker
                        value={dataInicio}
                        mode="datetime"
                        is24Hour={true}
                        onChange={(event, selectedDate) => {
                            setShowDateInicio(Platform.OS === 'ios');
                            if (selectedDate) setDataInicio(selectedDate);
                        }}
                    />
                )}

                <Text style={styles.label}>Data de Término *</Text>
                <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDateTermino(true)}
                >
                    <Text>{dataTermino.toLocaleString('pt-BR')}</Text>
                </TouchableOpacity>

                {showDateTermino && (
                    <DateTimePicker
                        value={dataTermino}
                        mode="datetime"
                        is24Hour={true}
                        onChange={(event, selectedDate) => {
                            setShowDateTermino(Platform.OS === 'ios');
                            if (selectedDate) setDataTermino(selectedDate);
                        }}
                    />
                )}

                <Text style={styles.label}>Sub-passos</Text>
                <View style={styles.subPassoInputContainer}>
                    <TextInput
                        style={[styles.input, styles.subPassoInput]}
                        value={novoSubPasso}
                        onChangeText={setNovoSubPasso}
                        placeholder="Adicionar sub-passo"
                    />
                    <TouchableOpacity style={styles.addSubPassoButton} onPress={adicionarSubPasso}>
                        <Text style={styles.addSubPassoButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

                {subPassos.map((subPasso, index) => (
                    <View key={index} style={styles.subPassoItem}>
                        <Text style={styles.subPassoText}>{subPasso.descricao}</Text>
                        <TouchableOpacity onPress={() => removerSubPasso(index)}>
                            <Text style={styles.removeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleSalvar}
                    disabled={loading}
                >
                    <Text style={styles.saveButtonText}>
                        {loading ? 'Salvando...' : isEdicao ? 'Atualizar Processo' : 'Criar Processo'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 15,
    },
    picker: {
        height: 50,
    },
    dateContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    dateButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginRight: 10,
    },
    nowButton: {
        backgroundColor: '#3498db',
        padding: 12,
        borderRadius: 8,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    nowButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    subPassoInputContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    subPassoInput: {
        flex: 1,
        marginBottom: 0,
        marginRight: 10,
    },
    addSubPassoButton: {
        backgroundColor: '#3498db',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addSubPassoButtonText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    subPassoItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    subPassoText: {
        flex: 1,
        fontSize: 14,
    },
    removeButton: {
        color: '#e74c3c',
        fontSize: 20,
        fontWeight: 'bold',
        padding: 5,
    },
    saveButton: {
        backgroundColor: '#27ae60',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    saveButtonDisabled: {
        backgroundColor: '#95a5a6',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});