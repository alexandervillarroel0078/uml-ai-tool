package com.test.controllers;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

import com.test.models.Auto;
import com.test.services.AutoService;

@RestController
@RequestMapping("/api/autos")
public class AutoController {

    private final AutoService service;

    public AutoController(AutoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Auto> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Auto> getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public Auto create(@RequestBody Auto entity) {
        return service.save(entity);
    }

    @PutMapping("/{id}")
    public Auto update(@PathVariable Long id, @RequestBody Auto entity) {
        entity.setId(id);
        return service.save(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}