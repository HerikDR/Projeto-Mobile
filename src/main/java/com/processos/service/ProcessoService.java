package com.gerenciamento.processos.service;

import com.gerenciamento.processos.dto.ProcessoDTO;
import com.gerenciamento.processos.dto.SubPassoDTO;
import com.gerenciamento.processos.exception.ResourceNotFoundException;
import com.gerenciamento.processos.model.Processo;
import com.gerenciamento.processos.model.Prioridade;
import com.gerenciamento.processos.model.SubPasso;
import com.gerenciamento.processos.repository.ProcessoRepository;
import com.gerenciamento.processos.repository.SubPassoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProcessoService {

    @Autowired
    private ProcessoRepository processoRepository;

    @Autowired
    private SubPassoRepository subPassoRepository;

    @Transactional
    public ProcessoDTO criarProcesso(ProcessoDTO dto) {
        validarDatas(dto);

        Processo processo = new Processo();
        processo.setTitulo(dto.getTitulo());
        processo.setDescricao(dto.getDescricao());
        processo.setPrioridade(dto.getPrioridade());
        processo.setDataInicio(dto.getDataInicio());
        processo.setDataTermino(dto.getDataTermino());
        processo.setConcluido(false);

        // Adicionar sub-passos
        if (dto.getSubPassos() != null && !dto.getSubPassos().isEmpty()) {
            for (SubPassoDTO subPassoDTO : dto.getSubPassos()) {
                SubPasso subPasso = new SubPasso();
                subPasso.setDescricao(subPassoDTO.getDescricao());
                subPasso.setConcluido(false);
                subPasso.setOrdemExibicao(subPassoDTO.getOrdemExibicao());
                processo.adicionarSubPasso(subPasso);
            }
        }

        Processo salvo = processoRepository.save(processo);
        return converterParaDTO(salvo);
    }

    public List<ProcessoDTO> listarTodos() {
        return processoRepository.findAll()
                .stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public ProcessoDTO buscarPorId(Long id) {
        Processo processo = processoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Processo não encontrado com ID: " + id));
        return converterParaDTO(processo);
    }

    @Transactional
    public ProcessoDTO atualizarProcesso(Long id, ProcessoDTO dto) {
        Processo processo = processoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Processo não encontrado com ID: " + id));

        validarDatas(dto);

        processo.setTitulo(dto.getTitulo());
        processo.setDescricao(dto.getDescricao());
        processo.setPrioridade(dto.getPrioridade());
        processo.setDataInicio(dto.getDataInicio());
        processo.setDataTermino(dto.getDataTermino());

        // Atualizar sub-passos
        processo.getSubPassos().clear();

        if (dto.getSubPassos() != null && !dto.getSubPassos().isEmpty()) {
            for (SubPassoDTO subPassoDTO : dto.getSubPassos()) {
                SubPasso subPasso = new SubPasso();
                if (subPassoDTO.getId() != null) {
                    subPasso.setId(subPassoDTO.getId());
                }
                subPasso.setDescricao(subPassoDTO.getDescricao());
                subPasso.setConcluido(subPassoDTO.getConcluido() != null ? subPassoDTO.getConcluido() : false);
                subPasso.setOrdemExibicao(subPassoDTO.getOrdemExibicao());
                processo.adicionarSubPasso(subPasso);
            }
        }

        // Verificar se todos sub-passos estão concluídos
        processo.setConcluido(processo.todosSubPassosConcluidos());

        Processo atualizado = processoRepository.save(processo);
        return converterParaDTO(atualizado);
    }

    @Transactional
    public void deletarProcesso(Long id) {
        if (!processoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Processo não encontrado com ID: " + id);
        }
        processoRepository.deleteById(id);
    }

    public List<ProcessoDTO> pesquisarPorTitulo(String titulo) {
        return processoRepository.findByTituloContainingIgnoreCase(titulo)
                .stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public List<ProcessoDTO> pesquisarPorTermo(String termo) {
        return processoRepository.pesquisarPorTermo(termo)
                .stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public List<ProcessoDTO> filtrarPorPrioridade(String prioridade) {
        Prioridade prioridadeEnum = Prioridade.valueOf(prioridade.toUpperCase());
        return processoRepository.findByPrioridade(prioridadeEnum)
                .stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProcessoDTO atualizarStatusSubPasso(Long processoId, Long subPassoId, Boolean concluido) {
        Processo processo = processoRepository.findById(processoId)
                .orElseThrow(() -> new ResourceNotFoundException("Processo não encontrado"));

        SubPasso subPasso = processo.getSubPassos().stream()
                .filter(sp -> sp.getId().equals(subPassoId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Sub-passo não encontrado"));

        subPasso.setConcluido(concluido);

        // Atualizar status do processo
        processo.setConcluido(processo.todosSubPassosConcluidos());

        Processo atualizado = processoRepository.save(processo);
        return converterParaDTO(atualizado);
    }

    private ProcessoDTO converterParaDTO(Processo processo) {
        ProcessoDTO dto = new ProcessoDTO();
        dto.setId(processo.getId());
        dto.setTitulo(processo.getTitulo());
        dto.setDescricao(processo.getDescricao());
        dto.setPrioridade(processo.getPrioridade());
        dto.setDataInicio(processo.getDataInicio());
        dto.setDataTermino(processo.getDataTermino());
        dto.setConcluido(processo.getConcluido());
        dto.setCriadoEm(processo.getCriadoEm());
        dto.setAtualizadoEm(processo.getAtualizadoEm());

        List<SubPassoDTO> subPassosDTO = processo.getSubPassos().stream()
                .map(sp -> new SubPassoDTO(sp.getId(), sp.getDescricao(), sp.getConcluido(), sp.getOrdemExibicao()))
                .collect(Collectors.toList());
        dto.setSubPassos(subPassosDTO);

        return dto;
    }

    private void validarDatas(ProcessoDTO dto) {
        if (dto.getDataTermino().isBefore(dto.getDataInicio())) {
            throw new IllegalArgumentException("Data de término não pode ser anterior à data de início");
        }
    }
}