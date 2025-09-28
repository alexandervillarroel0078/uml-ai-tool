package com.test.dtos;

import java.util.*;
import java.time.*;   // 👈 Import para LocalDate y LocalDateTime

public class MateriaDto {


    private Integer creditos;

    private String Sigla;

    private String nombre;



    public Integer getCreditos() {
        return creditos;
    }

    public void setCreditos(Integer creditos) {
        this.creditos = creditos;
    }

    public String getSigla() {
        return Sigla;
    }

    public void setSigla(String Sigla) {
        this.Sigla = Sigla;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

}