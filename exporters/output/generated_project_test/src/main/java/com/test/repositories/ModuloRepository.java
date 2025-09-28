// Template: repository.java.j2
package com.test.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.test.models.Modulo;

public interface ModuloRepository extends JpaRepository<Modulo, Long> {
}