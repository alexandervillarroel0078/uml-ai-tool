package com.test.controllers;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

import com.test.models.Factura;
import com.test.services.FacturaService;

@RestController
@RequestMapping("/api/facturas")
public class FacturaController {

    private final FacturaService service;

    public FacturaController(FacturaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Factura> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Factura> getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public Factura create(@RequestBody Factura entity) {
        return service.save(entity);
    }

    @PutMapping("/{id}")
    public Factura update(@PathVariable Long id, @RequestBody Factura entity) {
        entity.setId(id);
        return service.save(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}