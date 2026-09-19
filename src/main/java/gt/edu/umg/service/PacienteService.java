package gt.edu.umg.service;

import java.util.List;

import gt.edu.umg.core.entities.Paciente;
import gt.edu.umg.core.entities.Dtos.Request.PacienteFilterDto;
import gt.edu.umg.core.entities.Dtos.Response.PaginatedResponseDto;

public interface PacienteService {

    PaginatedResponseDto<Paciente> obtenerPaginado(PacienteFilterDto filtro);

    Paciente guardar(Paciente paciente);

    Paciente obtenerPorId(Long id);

    List<Paciente> obtenerTodos();

    void eliminar(Long id);
}
