// Template: repository.java.j2
package com.test.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.test.models.UnidadMedida;

public interface UnidadMedidaRepository extends JpaRepository<UnidadMedida, Long> {
}