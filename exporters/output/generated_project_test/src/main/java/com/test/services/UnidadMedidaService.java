// Template: service.java.j2
package com.test.services;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import com.test.models.UnidadMedida;
import com.test.repositories.UnidadMedidaRepository;

@Service
public class UnidadMedidaService {

    private final UnidadMedidaRepository repository;

    public UnidadMedidaService(UnidadMedidaRepository repository) {
        this.repository = repository;
    }

    public List<UnidadMedida> findAll() {
        return repository.findAll();
    }

    public Optional<UnidadMedida> findById(Long id) {
        return repository.findById(id);
    }

    public UnidadMedida save(UnidadMedida entity) {
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}