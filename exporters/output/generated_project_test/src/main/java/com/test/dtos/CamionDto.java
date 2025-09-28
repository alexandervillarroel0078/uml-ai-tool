package com.test.dtos;

import java.util.*;
import java.time.*;   // 👈 Import para LocalDate y LocalDateTime

public class CamionDto {


    private Integer capacidad;

    private Integer nroejes;



    public Integer getCapacidad() {
        return capacidad;
    }

    public void setCapacidad(Integer capacidad) {
        this.capacidad = capacidad;
    }

    public Integer getNroejes() {
        return nroejes;
    }

    public void setNroejes(Integer nroejes) {
        this.nroejes = nroejes;
    }

}