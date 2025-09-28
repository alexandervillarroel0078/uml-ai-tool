package com.test.controllers;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

import com.test.models.Modulo;
import com.test.services.ModuloService;

@RestController
@RequestMapping("/api/modulos")
public class ModuloController {

    private final ModuloService service;

    public ModuloController(ModuloService service) {
        this.service = service;
    }

    @GetMapping
    public List<Modulo> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Modulo> getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public Modulo create(@RequestBody Modulo entity) {
        return service.save(entity);
    }

    @PutMapping("/{id}")
    public Modulo update(@PathVariable Long id, @RequestBody Modulo entity) {
        entity.setId(id);
        return service.save(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}