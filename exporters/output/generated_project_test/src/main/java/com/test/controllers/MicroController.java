package com.test.controllers;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

import com.test.models.Micro;
import com.test.services.MicroService;

@RestController
@RequestMapping("/api/micros")
public class MicroController {

    private final MicroService service;

    public MicroController(MicroService service) {
        this.service = service;
    }

    @GetMapping
    public List<Micro> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Micro> getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public Micro create(@RequestBody Micro entity) {
        return service.save(entity);
    }

    @PutMapping("/{id}")
    public Micro update(@PathVariable Long id, @RequestBody Micro entity) {
        entity.setId(id);
        return service.save(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}