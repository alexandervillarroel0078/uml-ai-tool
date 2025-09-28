// Template: repository.java.j2
package com.test.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.test.models.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
}