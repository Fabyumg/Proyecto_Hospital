package gt.edu.umg.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import gt.edu.umg.core.entities.Paciente;
import gt.edu.umg.core.entities.Dtos.Request.PacienteFilterDto;
import gt.edu.umg.core.entities.Dtos.Request.PacienteRequestDto;
import gt.edu.umg.core.entities.Dtos.Response.PacienteResponseDto;
import gt.edu.umg.core.entities.Dtos.Response.PaginatedResponseDto;
import gt.edu.umg.mapper.PacienteMapper;
import gt.edu.umg.service.PacienteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/pacientes")
@Tag(name = "Pacientes", description = "Endpoints para la gestión paginada y filtrada de pacientes")
@SecurityRequirement(name = "bearerAuth")
public class PacienteController {

    private final PacienteService pacienteService;
    private final PacienteMapper pacienteMapper;

    public PacienteController(PacienteService pacienteService, PacienteMapper pacienteMapper) {
        this.pacienteService = pacienteService;
        this.pacienteMapper = pacienteMapper;
    }

    @GetMapping
    @Operation(summary = "Obtener lista de pacientes con paginación y filtros dinámicos", 
               description = "Retorna una respuesta estructurada con data y metadata (totalRecords, page, pageSize, totalPages, hasPreviousPage, hasNextPage). El límite máximo permitido para size es 200.")
    public ResponseEntity<PaginatedResponseDto<PacienteResponseDto>> obtenerPaginado(@ModelAttribute PacienteFilterDto filtro) {
        // Garantiza que la búsqueda se ejecute en BD con Specification
        PaginatedResponseDto<Paciente> pacientesPaginados = pacienteService.obtenerPaginado(filtro);

        // Mapea la lista de contenido a DTOs de respuesta
        List<PacienteResponseDto> dtoList = pacientesPaginados.getData()
                .stream()
                .map(pacienteMapper::toDto)
                .toList();

        PaginatedResponseDto<PacienteResponseDto> respuesta = new PaginatedResponseDto<>(
                dtoList,
                pacientesPaginados.getMetadata()
        );

        return ResponseEntity.ok(respuesta);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PACIENTES_REGISTRAR') or hasRole('ADMINISTRADOR')")
    @Operation(summary = "Registrar un nuevo paciente")
    public ResponseEntity<PacienteResponseDto> crear(@Valid @RequestBody PacienteRequestDto request) {
        Paciente entidad = pacienteMapper.toEntity(request);
        Paciente guardado = pacienteService.guardar(entidad);
        return new ResponseEntity<>(pacienteMapper.toDto(guardado), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un paciente por su ID")
    public ResponseEntity<PacienteResponseDto> obtenerPorId(@PathVariable Long id) {
        Paciente paciente = pacienteService.obtenerPorId(id);
        return ResponseEntity.ok(pacienteMapper.toDto(paciente));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Eliminar un paciente por su ID (Sólo Administrador)")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        pacienteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
