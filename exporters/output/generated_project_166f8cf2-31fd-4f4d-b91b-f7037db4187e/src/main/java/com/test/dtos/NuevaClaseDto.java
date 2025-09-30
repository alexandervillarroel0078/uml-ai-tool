package com.test.dtos;

import java.util.*;
import java.time.*;   // 👈 Import para LocalDate y LocalDateTime

public class NuevaClaseDto {


    private Integer campo;

    private String sd;



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