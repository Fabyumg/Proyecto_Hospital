package gt.edu.umg.core.entities.Dtos.Response;

import java.util.List;

public class LoginResponseDto {

    private String token;
    private String tokenType = "Bearer";
    private String username;
    private String nombre;
    private String apellido;
    private String email;
    private List<String> roles;
    private List<String> permisos;

    public LoginResponseDto() {
    }

    public LoginResponseDto(String token, String username, String nombre, String apellido, String email, List<String> roles, List<String> permisos) {
        this.token = token;
        this.username = username;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.roles = roles;
        this.permisos = permisos;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public List<String> getPermisos() {
        return permisos;
    }

    public void setPermisos(List<String> permisos) {
        this.permisos = permisos;
    }
}
