// Template: repository.java.j2
package com.test.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.test.models.Factura;

public interface FacturaRepository extends JpaRepository<Factura, Long> {
}