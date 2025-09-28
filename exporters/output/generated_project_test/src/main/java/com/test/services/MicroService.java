// Template: service.java.j2
package com.test.services;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import com.test.models.Micro;
import com.test.repositories.MicroRepository;

@Service
public class MicroService {

    private final MicroRepository repository;

    public MicroService(MicroRepository repository) {
        this.repository = repository;
    }

    public List<Micro> findAll() {
        return repository.findAll();
    }

    public Optional<Micro> findById(Long id) {
        return repository.findById(id);
    }

    public Micro save(Micro entity) {
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}