// Template: service.java.j2
package com.test.services;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import com.test.models.Aula;
import com.test.repositories.AulaRepository;

@Service
public class AulaService {

    private final AulaRepository repository;

    public AulaService(AulaRepository repository) {
        this.repository = repository;
    }

    public List<Aula> findAll() {
        return repository.findAll();
    }

    public Optional<Aula> findById(Long id) {
        return repository.findById(id);
    }

    public Aula save(Aula entity) {
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}