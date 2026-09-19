package gt.edu.umg.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import gt.edu.umg.core.entities.Cita;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {
}
