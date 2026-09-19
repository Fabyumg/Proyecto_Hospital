import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente, PacienteFilter, PaginatedResponse } from '../models/paciente.model';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private readonly API_URL = 'http://localhost:8080/api/v1/pacientes';

  constructor(private http: HttpClient) {}

  public getPacientesPaginado(filter: PacienteFilter): Observable<PaginatedResponse<Paciente>> {
    let params = new HttpParams();

    if (filter.page !== undefined && filter.page !== null) {
      params = params.set('page', filter.page.toString());
    }
    if (filter.size !== undefined && filter.size !== null) {
      params = params.set('size', filter.size.toString());
    }
    if (filter.nombre) {
      params = params.set('nombre', filter.nombre.trim());
    }
    if (filter.apellido) {
      params = params.set('apellido', filter.apellido.trim());
    }
    if (filter.dpi) {
      params = params.set('dpi', filter.dpi.trim());
    }
    if (filter.activo !== undefined && filter.activo !== null && filter.activo !== '') {
      params = params.set('activo', filter.activo.toString());
    }

    return this.http.get<PaginatedResponse<Paciente>>(this.API_URL, { params });
  }

  public getPacientePorId(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.API_URL}/${id}`);
  }

  public registrarPaciente(paciente: Paciente): Observable<Paciente> {
    return this.http.post<Paciente>(this.API_URL, paciente);
  }

  public eliminarPaciente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
