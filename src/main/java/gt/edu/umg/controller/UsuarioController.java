package gt.edu.umg.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import gt.edu.umg.core.entities.Rol;
import gt.edu.umg.core.entities.Usuario;
import gt.edu.umg.dao.RolRepository;
import gt.edu.umg.dao.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/v1/usuarios")
@Tag(name = "Usuarios", description = "Endpoints de administración de usuarios y roles")
@SecurityRequirement(name = "bearerAuth")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(UsuarioRepository usuarioRepository, RolRepository rolRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Obtener lista de usuarios del sistema (sin contraseñas)")
    public ResponseEntity<List<UsuarioResponseDto>> obtenerUsuarios() {
        return ResponseEntity.ok(usuarioRepository.findAll().stream().map(UsuarioResponseDto::from).toList());
    }

    @GetMapping("/roles")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Obtener lista de roles disponibles")
    public ResponseEntity<List<Rol>> obtenerRoles() {
        return ResponseEntity.ok(rolRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Crear nuevo usuario con contraseña cifrada (BCrypt) y asignación de rol")
    public ResponseEntity<?> crearUsuario(@Valid @RequestBody UsuarioRequestDto request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim();

        if (usuarioRepository.existsByUsername(username)) {
            return conflict("El nombre de usuario ya está registrado.");
        }
        if (usuarioRepository.existsByEmail(email)) {
            return conflict("El correo electrónico ya está registrado.");
        }

        Optional<Rol> rol = rolRepository.findByNombre(request.getRolNombre().trim().toUpperCase());
        if (rol.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "ROL_INVALIDO",
                    "message", "El rol '" + request.getRolNombre() + "' no existe."));
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(username);
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setNombre(request.getNombre().trim());
        usuario.setApellido(request.getApellido().trim());
        usuario.setEmail(email);
        usuario.setActivo(true);
        usuario.setRoles(Set.of(rol.get()));

        Usuario guardado = usuarioRepository.save(usuario);
        return new ResponseEntity<>(UsuarioResponseDto.from(guardado), HttpStatus.CREATED);
    }

    private ResponseEntity<Map<String, Object>> conflict(String message) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "DUPLICADO", "message", message));
    }

    /** Datos de entrada para crear un usuario. */
    public static class UsuarioRequestDto {
        @NotBlank(message = "El nombre de usuario es obligatorio")
        @Size(min = 3, max = 50, message = "El nombre de usuario debe tener entre 3 y 50 caracteres")
        @Pattern(regexp = "^[A-Za-z0-9._-]+$", message = "El nombre de usuario solo puede contener letras, números, punto, guion y guion bajo")
        private String username;

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
        private String password;

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100)
        private String nombre;

        @NotBlank(message = "El apellido es obligatorio")
        @Size(max = 100)
        private String apellido;

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato válido")
        @Size(max = 100)
        private String email;

        @NotBlank(message = "El rol es obligatorio")
        private String rolNombre;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public String getApellido() { return apellido; }
        public void setApellido(String apellido) { this.apellido = apellido; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRolNombre() { return rolNombre; }
        public void setRolNombre(String rolNombre) { this.rolNombre = rolNombre; }
    }

    /** Respuesta pública de usuario: nunca incluye la contraseña ni su hash. */
    public record UsuarioResponseDto(Long id, String username, String nombre, String apellido, String email,
                                     Boolean activo, LocalDateTime fechaCreacion, List<Map<String, Object>> roles) {
        static UsuarioResponseDto from(Usuario u) {
            List<Map<String, Object>> roles = u.getRoles().stream()
                    .map(r -> Map.<String, Object>of("id", r.getId(), "nombre", r.getNombre()))
                    .toList();
            return new UsuarioResponseDto(u.getId(), u.getUsername(), u.getNombre(), u.getApellido(),
                    u.getEmail(), u.getActivo(), u.getFechaCreacion(), roles);
        }
    }
}
