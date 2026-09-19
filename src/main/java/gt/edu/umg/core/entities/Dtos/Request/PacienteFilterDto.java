package gt.edu.umg.core.entities.Dtos.Request;

public class PacienteFilterDto {

    private String nombre;
    private String apellido;
    private String dpi;
    private Boolean activo;
    private Integer page = 0;
    private Integer size = 10;

    public PacienteFilterDto() {
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

    public String getDpi() {
        return dpi;
    }

    public void setDpi(String dpi) {
        this.dpi = dpi;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Integer getPage() {
        return (page == null || page < 0) ? 0 : page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getSize() {
        if (size == null || size <= 0) {
            return 10;
        }
        // Límite máximo permitido para size: 200
        return Math.min(size, 200);
    }

    public void setSize(Integer size) {
        if (size != null && size > 200) {
            this.size = 200; // Cappeado a límite máximo 200
        } else {
            this.size = size;
        }
    }
}
