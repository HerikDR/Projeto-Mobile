import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ProcessoItem({ processo, onPress, onEdit, onDelete }) {
    const [expanded, setExpanded] = useState(false);

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

    const subPassosConcluidos = processo.subPassos.filter((sp) => sp.concluido).length;
    const totalSubPassos = processo.subPassos.length;

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => setExpanded(!expanded)}
                activeOpacity={0.7}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.titulo} numberOfLines={1}>
                        {processo.titulo}
                    </Text>
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

                <View style={styles.infoRow}>
                    <Text style={styles.infoText}>
                        Sub-passos: {subPassosConcluidos}/{totalSubPassos}
                    </Text>
                    {processo.concluido && <Text style={styles.concluidoTag}>✓ Concluído</Text>}
                </View>

                <Text style={styles.expandIcon}>{expanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {expanded && (
                <View style={styles.detalhes}>
                    {processo.descricao && (
                        <Text style={styles.descricao} numberOfLines={3}>
                            {processo.descricao}
                        </Text>
                    )}

                    <View style={styles.dateInfo}>
                        <Text style={styles.dateLabel}>Início:</Text>
                        <Text style={styles.dateValue}>
                            {new Date(processo.dataInicio).toLocaleDateString('pt-BR')}
                        </Text>
                    </View>

                    <View style={styles.dateInfo}>
                        <Text style={styles.dateLabel}>Término:</Text>
                        <Text style={styles.dateValue}>
                            {new Date(processo.dataTermino).toLocaleDateString('pt-BR')}
                        </Text>
                    </View>

                    <View style={styles.actionsContainer}>
                        <TouchableOpacity style={styles.detailButton} onPress={onPress}>
                            <Text style={styles.buttonText}>Ver Detalhes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
                            <Text style={styles.buttonText}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                            <Text style={styles.buttonText}>Excluir</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    header: {
        padding: 15,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    titulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    prioridadeBadge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    prioridadeTexto: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoText: {
        fontSize: 14,
        color: '#666',
    },
    concluidoTag: {
        fontSize: 12,
        color: '#27ae60',
        fontWeight: 'bold',
    },
    expandIcon: {
        position: 'absolute',
        right: 15,
        bottom: 15,
        fontSize: 12,
        color: '#95a5a6',
    },
    detalhes: {
        paddingHorizontal: 15,
        paddingBottom: 15,
        borderTopWidth: 1,
        borderTopColor: '#ecf0f1',
    },
    descricao: {
        fontSize: 14,
        color: '#666',
        marginTop: 10,
        marginBottom: 10,
    },
    dateInfo: {
        flexDirection: 'row',
        marginVertical: 4,
    },
    dateLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        width: 70,
        color: '#333',
    },
    dateValue: {
        fontSize: 14,
        color: '#666',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    detailButton: {
        flex: 1,
        backgroundColor: '#3498db',
        padding: 10,
        borderRadius: 5,
        marginRight: 5,
        alignItems: 'center',
    },
    editButton: {
        flex: 1,
        backgroundColor: '#f39c12',
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    deleteButton: {
        flex: 1,
        backgroundColor: '#e74c3c',
        padding: 10,
        borderRadius: 5,
        marginLeft: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});