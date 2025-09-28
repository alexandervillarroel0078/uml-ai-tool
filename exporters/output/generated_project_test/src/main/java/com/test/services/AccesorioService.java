// Template: service.java.j2
package com.test.services;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import com.test.models.Accesorio;
import com.test.repositories.AccesorioRepository;

@Service
public class AccesorioService {

    private final AccesorioRepository repository;

    public AccesorioService(AccesorioRepository repository) {
        this.repository = repository;
    }

    public List<Accesorio> findAll() {
        return repository.findAll();
    }

    public Optional<Accesorio> findById(Long id) {
        return repository.findById(id);
    }

    public Accesorio save(Accesorio entity) {
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}