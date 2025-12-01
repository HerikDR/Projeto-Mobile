package com.gerenciamento.processos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "processo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Processo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Prioridade prioridade;

    @Column(name = "data_inicio", nullable = false)
    private LocalDateTime dataInicio;

    @Column(name = "data_termino", nullable = false)
    private LocalDateTime dataTermino;

    @Column(nullable = false)
    private Boolean concluido = false;

    @OneToMany(mappedBy = "processo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubPasso> subPassos = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    // Método para adicionar sub-passo
    public void adicionarSubPasso(SubPasso subPasso) {
        subPassos.add(subPasso);
        subPasso.setProcesso(this);
    }

    // Método para verificar se todos sub-passos estão concluídos
    public boolean todosSubPassosConcluidos() {
        if (subPassos.isEmpty()) {
            return false;
        }
        return subPassos.stream().allMatch(SubPasso::getConcluido);
    }
}