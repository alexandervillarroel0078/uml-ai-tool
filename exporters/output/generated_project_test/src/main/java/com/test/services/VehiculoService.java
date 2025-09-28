// Template: service.java.j2
package com.test.services;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import com.test.models.Vehiculo;
import com.test.repositories.VehiculoRepository;

@Service
public class VehiculoService {

    private final VehiculoRepository repository;

    public VehiculoService(VehiculoRepository repository) {
        this.repository = repository;
    }

    public List<Vehiculo> findAll() {
        return repository.findAll();
    }

    public Optional<Vehiculo> findById(Long id) {
        return repository.findById(id);
    }

    public Vehiculo save(Vehiculo entity) {
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}