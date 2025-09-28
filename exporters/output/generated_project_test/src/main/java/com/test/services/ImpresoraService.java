// Template: service.java.j2
package com.test.services;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import com.test.models.Impresora;
import com.test.repositories.ImpresoraRepository;

@Service
public class ImpresoraService {

    private final ImpresoraRepository repository;

    public ImpresoraService(ImpresoraRepository repository) {
        this.repository = repository;
    }

    public List<Impresora> findAll() {
        return repository.findAll();
    }

    public Optional<Impresora> findById(Long id) {
        return repository.findById(id);
    }

    public Impresora save(Impresora entity) {
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}