package com.test.models;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity
public class NuevaClase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer campo;

    private String sd;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getCampo() {
        return campo;
    }

    public void setCampo(Integer campo) {
        this.campo = campo;
    }

    public String getSd() {
        return sd;
    }

    public void setSd(String sd) {
        this.sd = sd;
    }

}