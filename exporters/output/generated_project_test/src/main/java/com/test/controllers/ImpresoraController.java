package com.test.controllers;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

import com.test.models.Impresora;
import com.test.services.ImpresoraService;

@RestController
@RequestMapping("/api/impresoras")
public class ImpresoraController {

    private final ImpresoraService service;

    public ImpresoraController(ImpresoraService service) {
        this.service = service;
    }

    @GetMapping
    public List<Impresora> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Impresora> getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public Impresora create(@RequestBody Impresora entity) {
        return service.save(entity);
    }

    @PutMapping("/{id}")
    public Impresora update(@PathVariable Long id, @RequestBody Impresora entity) {
        entity.setId(id);
        return service.save(entity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}