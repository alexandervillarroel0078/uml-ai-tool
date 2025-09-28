package com.test.controllers;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

import com.test.models.Vehiculo;
import com.test.services.VehiculoService;

@RestController
@RequestMapping("/api/vehiculos")
public class VehiculoController {

    private final VehiculoService service;

    public VehiculoController(VehiculoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Vehiculo> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Vehiculo> getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public Vehiculo create(@RequestBody Vehiculo entity) {
        return service.save(entity);
    }

    @PutMapping("/{id}")
    public Vehiculo update(@PathVariable Long id, @RequestBody Vehiculo entity) {
        entity.setId(id);
        return service.save(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}