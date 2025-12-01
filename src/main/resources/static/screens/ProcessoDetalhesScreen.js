import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { processoService } from '../services/api';

export default function ProcessoDetalhesScreen({ navigation, route }) {
    const { processoId } = route.params;
    const [processo, setProcesso] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarProcesso();
    }, []);

    const carregarProcesso = async () => {
        try {
            const response = await processoService.buscarPorId(processoId);
            if (response.sucesso) {
                setProcesso(response.dados);
            } else {
                Alert.alert('Erro', response.mensagem);
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar os detalhes.');
        } finally {
            setLoading(false);
        }
    };

    const toggleSubPasso = async (subPassoId, concluidoAtual) => {
        try {
            const response = await processoService.atualizarStatusSubPasso(
                processoId,
                subPassoId,
                !concluidoAtual
            );
            if (response.sucesso) {
                setProcesso(response.dados);
            } else {
                Alert.alert('Erro', response.mensagem);
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar o sub-passo.');
        }
    };

    const getPrioridadeCor = (prioridade) => {
        const cores = {
            OSCIOSO: '#95a5a6',
            BAIXA: '#3498db',
            MEDIA: '#f39c12',
            ALTA: '#e67e22',
            URGENTE: '#e74c3c',
        };
        return cores[prioridade] || '#95a5a6';
    };

    const getPrioridadeTexto = (prioridade) => {
        const textos = {
            OSCIOSO: 'Oscioso',
            BAIXA: 'Baixa',
            MEDIA: 'Média',
            ALTA: 'Alta',
            URGENTE: 'Urgente',
        };
        return textos[prioridade] || prioridade;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    if (!processo) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Processo não encontrado</Text>
            </View>
        );
    }

    const subPassosConcluidos = processo.subPassos.filter((sp) => sp.concluido).length;
    const totalSubPassos = processo.subPassos.length;
    const progresso = totalSubPassos > 0 ? (subPassosConcluidos / totalSubPassos) * 100 : 0;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.titulo}>{processo.titulo}</Text>
                <View
                    style={[
                        styles.prioridadeBadge,
                        { backgroundColor: getPrioridadeCor(processo.prioridade) },
                    ]}
                >
                    <Text style={styles.prioridadeTexto}>
                        {getPrioridadeTexto(processo.prioridade)}
                    </Text>
                </View>
            </View>

            {processo.descricao && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Descrição</Text>
                    <Text style={styles.descricao}>{processo.descricao}</Text>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Datas</Text>
                <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>Início:</Text>
                    <Text style={styles.dateValue}>
                        {new Date(processo.dataInicio).toLocaleString('pt-BR')}
                    </Text>
                </View>
                <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>Término:</Text>
                    <Text style={styles.dateValue}>
                        {new Date(processo.dataTermino).toLocaleString('pt-BR')}
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Sub-passos ({subPassosConcluidos}/{totalSubPassos})
                </Text>

                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${progresso}%` }]} />
                </View>
                <Text style={styles.progressText}>{progresso.toFixed(0)}% concluído</Text>

                {processo.subPassos.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhum sub-passo adicionado</Text>
                ) : (
                    processo.subPassos.map((subPasso) => (
                        <TouchableOpacity
                            key={subPasso.id}
                            style={styles.subPassoItem}
                            onPress={() => toggleSubPasso(subPasso.id, subPasso.concluido)}
                        >
                            <View style={styles.checkbox}>
                                {subPasso.concluido && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text
                                style={[
                                    styles.subPassoTexto,
                                    subPasso.concluido && styles.subPassoTextoConcluido,
                                ]}
                            >
                                {subPasso.descricao}
                            </Text>
                        </TouchableOpacity>
                    ))
                )}
            </View>

            {processo.concluido && (
                <View style={styles.concluidoBanner}>
                    <Text style={styles.concluidoTexto}>✓ Processo Concluído!</Text>
                </View>
            )}

            <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('ProcessoForm', { processoId })}
            >
                <Text style={styles.editButtonText}>Editar Processo</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#e74c3c',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    prioridadeBadge: {
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
    },
    prioridadeTexto: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 15,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    descricao: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    dateRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    dateLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        width: 80,
        color: '#333',
    },
    dateValue: {
        fontSize: 16,
        color: '#666',
        flex: 1,
    },
    progressBarContainer: {
        height: 20,
        backgroundColor: '#ecf0f1',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#27ae60',
    },
    progressText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 15,
    },
    subPassoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#3498db',
        borderRadius: 4,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        color: '#3498db',
        fontSize: 18,
        fontWeight: 'bold',
    },
    subPassoTexto: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    subPassoTextoConcluido: {
        textDecorationLine: 'line-through',
        color: '#95a5a6',
    },
    emptyText: {
        fontSize: 16,
        color: '#95a5a6',
        textAlign: 'center',
        paddingVertical: 20,
    },
    concluidoBanner: {
        backgroundColor: '#27ae60',
        padding: 15,
        margin: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    concluidoTexto: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    editButton: {
        backgroundColor: '#3498db',
        margin: 15,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 30,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});