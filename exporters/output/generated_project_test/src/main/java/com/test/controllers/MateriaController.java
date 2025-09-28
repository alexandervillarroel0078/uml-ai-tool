package com.test.controllers;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

import com.test.models.Materia;
import com.test.services.MateriaService;

@RestController
@RequestMapping("/api/materias")
public class MateriaController {

    private final MateriaService service;

    public MateriaController(MateriaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Materia> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Materia> getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public Materia create(@RequestBody Materia entity) {
        return service.save(entity);
    }

    @PutMapping("/{id}")
    public Materia update(@PathVariable Long id, @RequestBody Materia entity) {
        entity.setId(id);
        return service.save(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}