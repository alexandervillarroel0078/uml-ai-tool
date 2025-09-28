// Template: service.java.j2
package com.test.services;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

import com.test.models.Materia;
import com.test.repositories.MateriaRepository;

@Service
public class MateriaService {

    private final MateriaRepository repository;

    public MateriaService(MateriaRepository repository) {
        this.repository = repository;
    }

    public List<Materia> findAll() {
        return repository.findAll();
    }

    public Optional<Materia> findById(Long id) {
        return repository.findById(id);
    }

    public Materia save(Materia entity) {
        return repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}