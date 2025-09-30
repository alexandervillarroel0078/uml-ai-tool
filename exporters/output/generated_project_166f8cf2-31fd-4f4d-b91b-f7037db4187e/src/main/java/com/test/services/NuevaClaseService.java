// Template: service.java.j2
package com.test.services;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import com.test.models.NuevaClase;
import com.test.repositories.NuevaClaseRepository;

@Service
public class NuevaClaseService {

    private final NuevaClaseRepository repository;

    public NuevaClaseService(NuevaClaseRepository repository) {
        this.repository = repository;
    }

    public List<NuevaClase> findAll() {
        return repository.findAll();
    }

    public Optional<NuevaClase> findById(Long id) {
        return repository.findById(id);
    }

    public NuevaClase save(NuevaClase entity) {
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}