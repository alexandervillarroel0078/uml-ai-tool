// Template: service.java.j2
package com.test.services;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import com.test.models.Modulo;
import com.test.repositories.ModuloRepository;

@Service
public class ModuloService {

    private final ModuloRepository repository;

    public ModuloService(ModuloRepository repository) {
        this.repository = repository;
    }

    public List<Modulo> findAll() {
        return repository.findAll();
    }

    public Optional<Modulo> findById(Long id) {
        return repository.findById(id);
    }

    public Modulo save(Modulo entity) {
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}