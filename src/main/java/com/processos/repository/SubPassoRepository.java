package com.gerenciamento.processos.repository;

import com.gerenciamento.processos.model.SubPasso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubPassoRepository extends JpaRepository<SubPasso, Long> {
    List<SubPasso> findByProcessoId(Long processoId);
}