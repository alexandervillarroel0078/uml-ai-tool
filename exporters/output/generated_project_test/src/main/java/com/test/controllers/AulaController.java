package com.test.controllers;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

import com.test.models.Aula;
import com.test.services.AulaService;

@RestController
@RequestMapping("/api/aulas")
public class AulaController {

    private final AulaService service;

    public AulaController(AulaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Aula> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Aula> getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public Aula create(@RequestBody Aula entity) {
        return service.save(entity);
    }

    @PutMapping("/{id}")
    public Aula update(@PathVariable Long id, @RequestBody Aula entity) {
        entity.setId(id);
        return service.save(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}