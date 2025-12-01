package com.gerenciamento.processos.repository;

import com.gerenciamento.processos.model.Processo;
import com.gerenciamento.processos.model.Prioridade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcessoRepository extends JpaRepository<Processo, Long> {

    List<Processo> findByTituloContainingIgnoreCase(String titulo);

    List<Processo> findByPrioridade(Prioridade prioridade);

    List<Processo> findByConcluido(Boolean concluido);

    @Query("SELECT p FROM Processo p WHERE " +
            "LOWER(p.titulo) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
            "LOWER(p.descricao) LIKE LOWER(CONCAT('%', :termo, '%'))")
    List<Processo> pesquisarPorTermo(@Param("termo") String termo);
}