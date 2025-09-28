package com.test.controllers;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

import com.test.models.Accesorio;
import com.test.services.AccesorioService;

@RestController
@RequestMapping("/api/accesorios")
public class AccesorioController {

    private final AccesorioService service;

    public AccesorioController(AccesorioService service) {
        this.service = service;
    }

    @GetMapping
    public List<Accesorio> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Accesorio> getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public Accesorio create(@RequestBody Accesorio entity) {
        return service.save(entity);
    }

    @PutMapping("/{id}")
    public Accesorio update(@PathVariable Long id, @RequestBody Accesorio entity) {
        entity.setId(id);
        return service.save(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}