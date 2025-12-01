package com.gerenciamento.processos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubPassoDTO {
    private Long id;
    private String descricao;
    private Boolean concluido;
    private Integer ordemExibicao;
}

