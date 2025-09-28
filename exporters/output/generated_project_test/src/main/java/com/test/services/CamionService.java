// Template: service.java.j2
package com.test.services;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import com.test.models.Camion;
import com.test.repositories.CamionRepository;

@Service
public class CamionService {

    private final CamionRepository repository;

    public CamionService(CamionRepository repository) {
        this.repository = repository;
    }

    public List<Camion> findAll() {
        return repository.findAll();
    }

    public Optional<Camion> findById(Long id) {
        return repository.findById(id);
    }

    public Camion save(Camion entity) {
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}