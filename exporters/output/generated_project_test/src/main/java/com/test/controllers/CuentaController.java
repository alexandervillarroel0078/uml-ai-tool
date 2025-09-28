package com.test.controllers;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

import com.test.models.Cuenta;
import com.test.services.CuentaService;

@RestController
@RequestMapping("/api/cuentas")
public class CuentaController {

    private final CuentaService service;

    public CuentaController(CuentaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Cuenta> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Cuenta> getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public Cuenta create(@RequestBody Cuenta entity) {
        return service.save(entity);
    }

    @PutMapping("/{id}")
    public Cuenta update(@PathVariable Long id, @RequestBody Cuenta entity) {
        entity.setId(id);
        return service.save(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}