package com.test.controllers;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

import com.test.models.Camion;
import com.test.services.CamionService;

@RestController
@RequestMapping("/api/camions")
public class CamionController {

    private final CamionService service;

    public CamionController(CamionService service) {
        this.service = service;
    }

    @GetMapping
    public List<Camion> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Camion> getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public Camion create(@RequestBody Camion entity) {
        return service.save(entity);
    }

    @PutMapping("/{id}")
    public Camion update(@PathVariable Long id, @RequestBody Camion entity) {
        entity.setId(id);
        return service.save(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}