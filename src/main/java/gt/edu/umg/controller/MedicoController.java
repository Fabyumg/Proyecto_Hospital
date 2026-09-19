package gt.edu.umg.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import gt.edu.umg.core.entities.Medico;
import gt.edu.umg.dao.MedicoRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/medicos")
@Tag(name = "Médicos", description = "Endpoints para la gestión del cuerpo médico")
@SecurityRequirement(name = "bearerAuth")
public class MedicoController {

    private final MedicoRepository medicoRepository;

    public MedicoController(MedicoRepository medicoRepository) {
        this.medicoRepository = medicoRepository;
    }

    @GetMapping
    @Operation(summary = "Obtener lista de todos los médicos")
    public ResponseEntity<List<Medico>> obtenerTodos() {
        return ResponseEntity.ok(medicoRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MEDICOS_GESTION') or hasRole('ADMINISTRADOR')")
    @Operation(summary = "Registrar un nuevo médico especialista")
    public ResponseEntity<?> crear(@RequestBody Medico medico) {
        if (medicoRepository.existsByColegiado(medico.getColegiado())) {
            return ResponseEntity.badRequest().body("Ya existe un médico con el número de colegiado: " + medico.getColegiado());
        }
        Medico guardado = medicoRepository.save(medico);
        return new ResponseEntity<>(guardado, HttpStatus.CREATED);
    }
}
