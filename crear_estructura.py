import os

PROJECT_DIR = "spring_project"
JAVA_BASE = os.path.join(PROJECT_DIR, "src", "main", "java", "com", "example", "app")
RESOURCES_DIR = os.path.join(PROJECT_DIR, "src", "main", "resources")

def create_structure():
    # Crear carpetas principales
    os.makedirs(JAVA_BASE, exist_ok=True)
    for folder in ["models", "repositories", "services", "controllers", "dto"]:
        os.makedirs(os.path.join(JAVA_BASE, folder), exist_ok=True)
    os.makedirs(RESOURCES_DIR, exist_ok=True)

    # Clase principal
    main_class = """package com.example.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AppApplication {
    public static void main(String[] args) {
        SpringApplication.run(AppApplication.class, args);
    }
}
"""
    with open(os.path.join(JAVA_BASE, "AppApplication.java"), "w", encoding="utf-8") as f:
        f.write(main_class)

    # application.properties
    props = """spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.jpa.hibernate.ddl-auto=update
"""
    with open(os.path.join(RESOURCES_DIR, "application.properties"), "w", encoding="utf-8") as f:
        f.write(props)

    # pom.xml
    pom = """<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>app</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.0</version>
  </parent>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
      <groupId>com.h2database</groupId>
      <artifactId>h2</artifactId>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <optional>true</optional>
    </dependency>
  </dependencies>
</project>
"""
    with open(os.path.join(PROJECT_DIR, "pom.xml"), "w", encoding="utf-8") as f:
        f.write(pom)

    print("✅ Proyecto base Spring Boot creado en", PROJECT_DIR)

if __name__ == "__main__":
    create_structure()
