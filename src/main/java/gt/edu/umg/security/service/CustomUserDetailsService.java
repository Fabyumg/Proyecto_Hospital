package gt.edu.umg.security.service;

import java.util.HashSet;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gt.edu.umg.core.entities.Permiso;
import gt.edu.umg.core.entities.Rol;
import gt.edu.umg.core.entities.Usuario;
import gt.edu.umg.dao.UsuarioRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        Set<GrantedAuthority> authorities = new HashSet<>();

        for (Rol rol : usuario.getRoles()) {
            // Asigna el rol con prefijo ROLE_ (ej. ROLE_ADMINISTRADOR, ROLE_OPERADOR)
            authorities.add(new SimpleGrantedAuthority("ROLE_" + rol.getNombre()));
            // Asigna también sin prefijo para máxima compatibilidad
            authorities.add(new SimpleGrantedAuthority(rol.getNombre()));

            // Asigna permisos individuales como GrantedAuthority
            for (Permiso permiso : rol.getPermisos()) {
                authorities.add(new SimpleGrantedAuthority(permiso.getNombre()));
            }
        }

        return new User(
                usuario.getUsername(),
                usuario.getPassword(),
                usuario.getActivo(),
                true,
                true,
                true,
                authorities
        );
    }
}
