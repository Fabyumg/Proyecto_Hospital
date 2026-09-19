package gt.edu.umg.dao.specification;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import gt.edu.umg.core.entities.Paciente;
import gt.edu.umg.core.entities.Dtos.Request.PacienteFilterDto;
import jakarta.persistence.criteria.Predicate;

/**
 * Especificación dinámica JPA (Specification<Paciente>) para consultas WHERE en Base de Datos.
 * ESTRICTAMENTE CUMPLE CON EJECUTAR FILTROS A NIVEL DE BASE DE DATOS MEDIANTE CRITERIA API.
 */
public class PacienteSpecification {

    public static Specification<Paciente> conFiltros(PacienteFilterDto filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter == null) {
                return cb.conjunction();
            }

            // Filtro dinámico por Nombre (LIKE case-insensitive en BD)
            if (StringUtils.hasText(filter.getNombre())) {
                predicates.add(cb.like(cb.lower(root.get("nombre")), "%" + filter.getNombre().toLowerCase().trim() + "%"));
            }

            // Filtro dinámico por Apellido (LIKE case-insensitive en BD)
            if (StringUtils.hasText(filter.getApellido())) {
                predicates.add(cb.like(cb.lower(root.get("apellido")), "%" + filter.getApellido().toLowerCase().trim() + "%"));
            }

            // Filtro dinámico por DPI (Búsqueda exacta en BD)
            if (StringUtils.hasText(filter.getDpi())) {
                predicates.add(cb.equal(root.get("dpi"), filter.getDpi().trim()));
            }

            // Filtro dinámico por Estado Activo (Boolean en BD)
            if (filter.getActivo() != null) {
                predicates.add(cb.equal(root.get("activo"), filter.getActivo()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
