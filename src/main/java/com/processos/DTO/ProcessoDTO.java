package com.gerenciamento.processos.dto;

import com.gerenciamento.processos.model.Prioridade;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcessoDTO {

    private Long id;

    @NotBlank(message = "Título é obrigatório")
    private String titulo;

    private String descricao;

    @NotNull(message = "Prioridade é obrigatória")
    private Prioridade prioridade;

    @NotNull(message = "Data de início é obrigatória")
    private LocalDateTime dataInicio;

    @NotNull(message = "Data de término é obrigatória")
    private LocalDateTime dataTermino;

    private Boolean concluido;

    private List<SubPassoDTO> subPassos = new ArrayList<>();

    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
}