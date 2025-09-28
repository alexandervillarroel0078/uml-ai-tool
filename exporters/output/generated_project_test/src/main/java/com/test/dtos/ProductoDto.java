package com.test.dtos;

import java.util.*;
import java.time.*;   // 👈 Import para LocalDate y LocalDateTime

public class ProductoDto {


    private String descripcion;

    private Float precio;

    private String codigo;



    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Float getPrecio() {
        return precio;
    }

    public void setPrecio(Float precio) {
        this.precio = precio;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

}