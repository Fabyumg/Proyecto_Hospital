package gt.edu.umg.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import gt.edu.umg.core.entities.Medico;

@Repository
public interface MedicoRepository extends JpaRepository<Medico, Long> {
    Boolean existsByColegiado(String colegiado);
}
