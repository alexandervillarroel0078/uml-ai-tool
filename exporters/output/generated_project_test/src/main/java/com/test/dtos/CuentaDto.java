package com.test.dtos;

import java.util.*;
import java.time.*;   // 👈 Import para LocalDate y LocalDateTime

public class CuentaDto {


    private String descripcion;

    private String codigo;



    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

}