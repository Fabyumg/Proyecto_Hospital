package gt.edu.umg.service.impl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gt.edu.umg.core.entities.Paciente;
import gt.edu.umg.core.entities.Dtos.Request.PacienteFilterDto;
import gt.edu.umg.core.entities.Dtos.Response.PaginatedResponseDto;
import gt.edu.umg.dao.PacienteRepository;
import gt.edu.umg.dao.specification.PacienteSpecification;
import gt.edu.umg.service.PacienteService;

@Service
public class PacienteServiceImpl implements PacienteService {

    private final PacienteRepository pacienteRepository;

    public PacienteServiceImpl(PacienteRepository pacienteRepository) {
        this.pacienteRepository = pacienteRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponseDto<Paciente> obtenerPaginado(PacienteFilterDto filtro) {
        if (filtro == null) {
            filtro = new PacienteFilterDto();
        }

        // Límite máximo de size: 200 (garantizado en DTO y validación en servicio)
        int pageSize = Math.min(filtro.getSize(), 200);
        int pageNumber = filtro.getPage();

        // Paginación y Ordenamiento descendente por ID o fecha de creación
        Pageable pageable = PageRequest.of(
                pageNumber,
                pageSize,
                Sort.by(Sort.Direction.DESC, "fechaCreacion", "id")
        );

        // Construcción de la consulta WHERE dinámica en BD mediante Specification
        Specification<Paciente> spec = PacienteSpecification.conFiltros(filtro);

        // Ejecución directa de la consulta SQL filtrada y paginada en la Base de Datos
        Page<Paciente> pacientePage = pacienteRepository.findAll(spec, pageable);

        return PaginatedResponseDto.fromPage(pacientePage);
    }

    @Override
    @Transactional
    public Paciente guardar(Paciente paciente) {
        if (paciente.getId() == null && pacienteRepository.existsByDpi(paciente.getDpi())) {
            throw new IllegalArgumentException("Ya existe un paciente registrado con el DPI: " + paciente.getDpi());
        }
        return pacienteRepository.save(paciente);
    }

    @Override
    @Transactional(readOnly = true)
    public Paciente obtenerPorId(Long id) {
        return pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado con ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Paciente> obtenerTodos() {
        return pacienteRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        if (!pacienteRepository.existsById(id)) {
            throw new RuntimeException("No se encuentra el paciente con ID: " + id);
        }
        pacienteRepository.deleteById(id);
    }
}
