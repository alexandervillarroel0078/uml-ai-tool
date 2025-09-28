// Template: repository.java.j2
package com.test.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.test.models.Aula;

public interface AulaRepository extends JpaRepository<Aula, Long> {
}