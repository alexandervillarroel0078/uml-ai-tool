// Template: service.java.j2
package com.test.services;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import com.test.models.Auto;
import com.test.repositories.AutoRepository;

@Service
public class AutoService {

    private final AutoRepository repository;

    public AutoService(AutoRepository repository) {
        this.repository = repository;
    }

    public List<Auto> findAll() {
        return repository.findAll();
    }

    public Optional<Auto> findById(Long id) {
        return repository.findById(id);
    }

    public Auto save(Auto entity) {
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}