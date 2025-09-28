package com.test.controllers;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

import com.test.models.UnidadMedida;
import com.test.services.UnidadMedidaService;

@RestController
@RequestMapping("/api/unidadmedidas")
public class UnidadMedidaController {

    private final UnidadMedidaService service;

    public UnidadMedidaController(UnidadMedidaService service) {
        this.service = service;
    }

    @GetMapping
    public List<UnidadMedida> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<UnidadMedida> getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public UnidadMedida create(@RequestBody UnidadMedida entity) {
        return service.save(entity);
    }

    @PutMapping("/{id}")
    public UnidadMedida update(@PathVariable Long id, @RequestBody UnidadMedida entity) {
        entity.setId(id);
        return service.save(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}