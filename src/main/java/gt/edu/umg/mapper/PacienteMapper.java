package gt.edu.umg.mapper;

import java.time.LocalDate;
import java.time.Period;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import gt.edu.umg.core.entities.Paciente;
import gt.edu.umg.core.entities.Dtos.Request.PacienteRequestDto;
import gt.edu.umg.core.entities.Dtos.Response.PacienteResponseDto;

@Mapper(componentModel = "spring")
public interface PacienteMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "activo", constant = "true")
    @Mapping(target = "fechaCreacion", ignore = true)
    Paciente toEntity(PacienteRequestDto dto);

    @Mapping(target = "edad", expression = "java(calcularEdad(entity.getFechaNacimiento()))")
    PacienteResponseDto toDto(Paciente entity);

    default Integer calcularEdad(LocalDate fechaNacimiento) {
        if (fechaNacimiento == null) {
            return null;
        }
        return Period.between(fechaNacimiento, LocalDate.now()).getYears();
    }
}
