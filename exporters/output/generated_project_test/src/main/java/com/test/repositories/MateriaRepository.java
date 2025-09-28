// Template: repository.java.j2
package com.test.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.test.models.Materia;

public interface MateriaRepository extends JpaRepository<Materia, Long> {
}