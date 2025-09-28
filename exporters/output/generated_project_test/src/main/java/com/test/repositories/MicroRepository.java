// Template: repository.java.j2
package com.test.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.test.models.Micro;

public interface MicroRepository extends JpaRepository<Micro, Long> {
}