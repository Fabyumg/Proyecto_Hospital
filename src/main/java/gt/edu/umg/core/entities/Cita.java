package gt.edu.umg.core.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "citas")
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_cita", nullable = false, unique = true, length = 20)
    private String codigoCita;

    @Column(name = "paciente_nombre", nullable = false, length = 100)
    private String pacienteNombre;

    @Column(name = "paciente_dpi", nullable = false, length = 13)
    private String pacienteDpi;

    @Column(name = "medico_nombre", nullable = false, length = 100)
    private String medicoNombre;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @Column(length = 255)
    private String motivo;

    @Column(nullable = false, length = 20)
    private String estado = "CONFIRMADA";

    @PrePersist
    public void prePersist() {
        if (codigoCita == null) {
            codigoCita = "CIT-" + System.currentTimeMillis() % 100000;
        }
        if (estado == null) {
            estado = "CONFIRMADA";
        }
    }

    public Cita() {
    }

    public Cita(String pacienteNombre, String pacienteDpi, String medicoNombre, LocalDateTime fechaHora, String motivo) {
        this.pacienteNombre = pacienteNombre;
        this.pacienteDpi = pacienteDpi;
        this.medicoNombre = medicoNombre;
        this.fechaHora = fechaHora;
        this.motivo = motivo;
        this.estado = "CONFIRMADA";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigoCita() {
        return codigoCita;
    }

    public void setCodigoCita(String codigoCita) {
        this.codigoCita = codigoCita;
    }

    public String getPacienteNombre() {
        return pacienteNombre;
    }

    public void setPacienteNombre(String pacienteNombre) {
        this.pacienteNombre = pacienteNombre;
    }

    public String getPacienteDpi() {
        return pacienteDpi;
    }

    public void setPacienteDpi(String pacienteDpi) {
        this.pacienteDpi = pacienteDpi;
    }

    public String getMedicoNombre() {
        return medicoNombre;
    }

    public void setMedicoNombre(String medicoNombre) {
        this.medicoNombre = medicoNombre;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }

    public void setFechaHora(LocalDateTime fechaHora) {
        this.fechaHora = fechaHora;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
