package com.test.dtos;

import java.util.*;
import java.time.*;   // 👈 Import para LocalDate y LocalDateTime

public class ModuloDto {


    private String codigo;

    private String ubicacion;



    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

}