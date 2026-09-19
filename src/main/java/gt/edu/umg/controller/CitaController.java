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

import gt.edu.umg.core.entities.Cita;
import gt.edu.umg.dao.CitaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/citas")
@Tag(name = "Citas", description = "Endpoints para agendamiento y gestión de citas")
@SecurityRequirement(name = "bearerAuth")
public class CitaController {

    private final CitaRepository citaRepository;

    public CitaController(CitaRepository citaRepository) {
        this.citaRepository = citaRepository;
    }

    @GetMapping
    @Operation(summary = "Obtener lista de todas las citas agendadas")
    public ResponseEntity<List<Cita>> obtenerTodas() {
        return ResponseEntity.ok(citaRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CITAS_GESTION') or hasRole('ADMINISTRADOR') or hasRole('OPERADOR')")
    @Operation(summary = "Agendar una nueva cita médica")
    public ResponseEntity<Cita> agendar(@RequestBody Cita cita) {
        Cita guardada = citaRepository.save(cita);
        return new ResponseEntity<>(guardada, HttpStatus.CREATED);
    }
}
