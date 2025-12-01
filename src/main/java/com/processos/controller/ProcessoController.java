package com.gerenciamento.processos.controller;

import com.gerenciamento.processos.dto.ProcessoDTO;
import com.gerenciamento.processos.dto.ResponseDTO;
import com.gerenciamento.processos.exception.ResourceNotFoundException;
import com.gerenciamento.processos.service.ProcessoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/processos")
@CrossOrigin(origins = "*")
public class ProcessoController {

    @Autowired
    private ProcessoService processoService;

    @PostMapping
    public ResponseEntity<ResponseDTO> criarProcesso(@Valid @RequestBody ProcessoDTO dto) {
        try {
            ProcessoDTO criado = processoService.criarProcesso(dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ResponseDTO(true, "Processo criado com sucesso!", criado));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(false, "Erro ao criar processo: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ResponseDTO> listarTodos() {
        try {
            List<ProcessoDTO> processos = processoService.listarTodos();
            return ResponseEntity.ok(new ResponseDTO(true, "Processos recuperados com sucesso", processos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(false, "Erro ao listar processos: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseDTO> buscarPorId(@PathVariable Long id) {
        try {
            ProcessoDTO processo = processoService.buscarPorId(id);
            return ResponseEntity.ok(new ResponseDTO(true, "Processo encontrado", processo));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDTO(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(false, "Erro ao buscar processo: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseDTO> atualizarProcesso(@PathVariable Long id, @Valid @RequestBody ProcessoDTO dto) {
        try {
            ProcessoDTO atualizado = processoService.atualizarProcesso(id, dto);
            return ResponseEntity.ok(new ResponseDTO(true, "Processo atualizado com sucesso!", atualizado));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDTO(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(false, "Erro ao atualizar processo: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDTO> deletarProcesso(@PathVariable Long id) {
        try {
            processoService.deletarProcesso(id);
            return ResponseEntity.ok(new ResponseDTO(true, "Processo excluído com sucesso!"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDTO(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(false, "Erro ao excluir processo: " + e.getMessage()));
        }
    }

    @GetMapping("/pesquisar")
    public ResponseEntity<ResponseDTO> pesquisarPorTitulo(@RequestParam String titulo) {
        try {
            List<ProcessoDTO> processos = processoService.pesquisarPorTitulo(titulo);
            return ResponseEntity.ok(new ResponseDTO(true, "Pesquisa realizada com sucesso", processos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(false, "Erro na pesquisa: " + e.getMessage()));
        }
    }

    @GetMapping("/buscar")
    public ResponseEntity<ResponseDTO> pesquisarPorTermo(@RequestParam String termo) {
        try {
            List<ProcessoDTO> processos = processoService.pesquisarPorTermo(termo);
            return ResponseEntity.ok(new ResponseDTO(true, "Busca realizada com sucesso", processos));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(false, "Erro na busca: " + e.getMessage()));
        }
    }

    @PatchMapping("/{processoId}/subpassos/{subPassoId}")
    public ResponseEntity<ResponseDTO> atualizarStatusSubPasso(
            @PathVariable Long processoId,
            @PathVariable Long subPassoId,
            @RequestParam Boolean concluido) {
        try {
            ProcessoDTO atualizado = processoService.atualizarStatusSubPasso(processoId, subPassoId, concluido);
            return ResponseEntity.ok(new ResponseDTO(true, "Status atualizado com sucesso!", atualizado));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDTO(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponseDTO(false, "Erro ao atualizar status: " + e.getMessage()));
        }
    }
}
