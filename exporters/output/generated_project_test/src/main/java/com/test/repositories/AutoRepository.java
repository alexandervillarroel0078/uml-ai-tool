// Template: repository.java.j2
package com.test.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.test.models.Auto;

public interface AutoRepository extends JpaRepository<Auto, Long> {
}