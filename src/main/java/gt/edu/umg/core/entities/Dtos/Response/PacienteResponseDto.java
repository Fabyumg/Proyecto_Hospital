package gt.edu.umg.core.entities.Dtos.Response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PacienteResponseDto(
        Long id,
        String nombre,
        String apellido,
        String dpi,
        String telefono,
        String correo,
        LocalDate fechaNacimiento,
        Integer edad,
        Boolean activo,
        LocalDateTime fechaCreacion
) {}
