package gt.edu.umg.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gt.edu.umg.core.entities.Dtos.Request.LoginRequestDto;
import gt.edu.umg.core.entities.Dtos.Response.LoginResponseDto;
import gt.edu.umg.core.entities.Permiso;
import gt.edu.umg.core.entities.Rol;
import gt.edu.umg.core.entities.Usuario;
import gt.edu.umg.dao.UsuarioRepository;
import gt.edu.umg.security.jwt.JwtTokenProvider;
import gt.edu.umg.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UsuarioRepository usuarioRepository;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           JwtTokenProvider tokenProvider,
                           UsuarioRepository usuarioRepository) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponseDto login(LoginRequestDto loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        Usuario usuario = usuarioRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        List<String> roles = new ArrayList<>();
        List<String> permisos = new ArrayList<>();

        for (Rol rol : usuario.getRoles()) {
            roles.add(rol.getNombre());
            for (Permiso permiso : rol.getPermisos()) {
                if (!permisos.contains(permiso.getNombre())) {
                    permisos.add(permiso.getNombre());
                }
            }
        }

        // Emisión de Token JWT firmado con RSA Private Key
        String jwt = tokenProvider.generateToken(authentication, roles, permisos);

        return new LoginResponseDto(
                jwt,
                usuario.getUsername(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getEmail(),
                roles,
                permisos
        );
    }
}
