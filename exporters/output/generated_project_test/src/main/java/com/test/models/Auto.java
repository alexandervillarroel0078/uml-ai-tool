package com.test.models;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity
public class Auto extends Vehiculo {

    private Integer nropasajeros;

    public Integer getNropasajeros() {
        return nropasajeros;
    }

    public void setNropasajeros(Integer nropasajeros) {
        this.nropasajeros = nropasajeros;
    }

}