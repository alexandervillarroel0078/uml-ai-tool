package com.test.models;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity
public class Camion extends Vehiculo {

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