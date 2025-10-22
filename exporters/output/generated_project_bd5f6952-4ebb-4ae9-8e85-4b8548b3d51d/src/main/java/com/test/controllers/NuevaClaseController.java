package com.test.controllers;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

import com.test.models.NuevaClase;
import com.test.services.NuevaClaseService;

@RestController
@RequestMapping("/api/nuevaclases")
public class NuevaClaseController {

    private final NuevaClaseService service;

    public NuevaClaseController(NuevaClaseService service) {
        this.service = service;
    }

    @GetMapping
    public List<NuevaClase> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<NuevaClase> getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public NuevaClase create(@RequestBody NuevaClase entity) {
        return service.save(entity);
    }

    @PutMapping("/{id}")
    public NuevaClase update(@PathVariable Long id, @RequestBody NuevaClase entity) {
        entity.setId(id);
        return service.save(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}