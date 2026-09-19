package gt.edu.umg.config;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import gt.edu.umg.core.entities.Paciente;
import gt.edu.umg.core.entities.Permiso;
import gt.edu.umg.core.entities.Rol;
import gt.edu.umg.core.entities.Usuario;
import gt.edu.umg.dao.PacienteRepository;
import gt.edu.umg.dao.RolRepository;
import gt.edu.umg.dao.UsuarioRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PacienteRepository pacienteRepository;
    private final PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    public DataInitializer(UsuarioRepository usuarioRepository,
                           RolRepository rolRepository,
                           PacienteRepository pacienteRepository,
                           PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.pacienteRepository = pacienteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (usuarioRepository.count() > 0) {
            logger.info("Los usuarios ya se encuentran cargados en la base de datos.");
            return;
        }

        logger.info("Inicializando datos por defecto (Permisos, Roles, Usuarios admin/operador y Pacientes)...");

        // 1. Crear Permisos
        Permiso permConsultar = new Permiso("PACIENTES_CONSULTAR", "Consultar pacientes paginados");
        Permiso permRegistrar = new Permiso("PACIENTES_REGISTRAR", "Registrar nuevos pacientes");
        Permiso permMedicos = new Permiso("MEDICOS_GESTION", "Gestión de médicos");
        Permiso permCitas = new Permiso("CITAS_GESTION", "Gestión de citas");
        Permiso permAdmin = new Permiso("ADMINISTRACION_GESTION", "Gestión administrativa");

        entityManager.persist(permConsultar);
        entityManager.persist(permRegistrar);
        entityManager.persist(permMedicos);
        entityManager.persist(permCitas);
        entityManager.persist(permAdmin);

        // 2. Crear Roles
        Rol rolAdmin = new Rol("ADMINISTRADOR", "Acceso total a todas las funciones");
        rolAdmin.setPermisos(Set.of(permConsultar, permRegistrar, permMedicos, permCitas, permAdmin));
        rolRepository.save(rolAdmin);

        Rol rolOperador = new Rol("OPERADOR", "Acceso limitado a inicio, consulta y citas");
        rolOperador.setPermisos(Set.of(permConsultar, permCitas));
        rolRepository.save(rolOperador);

        // 3. Crear Usuarios Predeterminados (admin / admin1, operador / admin1)
        String passHash = passwordEncoder.encode("admin1");

        Usuario userAdmin = new Usuario();
        userAdmin.setUsername("admin");
        userAdmin.setPassword(passHash);
        userAdmin.setNombre("Administrador");
        userAdmin.setApellido("Sistema");
        userAdmin.setEmail("admin@hospital.com");
        userAdmin.setActivo(true);
        userAdmin.setRoles(Set.of(rolAdmin));
        usuarioRepository.save(userAdmin);

        Usuario userOperador = new Usuario();
        userOperador.setUsername("operador");
        userOperador.setPassword(passHash);
        userOperador.setNombre("Operador");
        userOperador.setApellido("Recepcion");
        userOperador.setEmail("operador@hospital.com");
        userOperador.setActivo(true);
        userOperador.setRoles(Set.of(rolOperador));
        usuarioRepository.save(userOperador);

        // 4. Crear Registros Iniciales de Pacientes
        if (pacienteRepository.count() == 0) {
            pacienteRepository.save(crearPaciente("Juan", "Pérez", "2589631470101", "55443322", "juan@email.com", LocalDate.of(1990, 5, 15), true));
            pacienteRepository.save(crearPaciente("María", "Gómez", "1472583690101", "55112233", "maria@email.com", LocalDate.of(1985, 8, 20), true));
            pacienteRepository.save(crearPaciente("Carlos", "López", "3692581470101", "44332211", "carlos@email.com", LocalDate.of(1992, 11, 3), true));
            pacienteRepository.save(crearPaciente("Ana", "Martínez", "7894561230101", "44112233", "ana@email.com", LocalDate.of(1995, 2, 14), true));
            pacienteRepository.save(crearPaciente("Roberto", "Hernández", "1237894560101", "33221100", "roberto@email.com", LocalDate.of(1980, 9, 30), true));
        }

        logger.info("¡Datos iniciales cargados correctamente!");
    }

    private Paciente crearPaciente(String nombre, String apellido, String dpi, String tel, String email, LocalDate fnac, boolean activo) {
        Paciente p = new Paciente(nombre, apellido, dpi, activo);
        p.setTelefono(tel);
        p.setCorreo(email);
        p.setFechaNacimiento(fnac);
        return p;
    }
}
