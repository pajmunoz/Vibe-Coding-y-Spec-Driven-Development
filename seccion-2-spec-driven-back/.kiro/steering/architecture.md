# Arquitectura Hexagonal Objetivo
Organización en tres capas concéntricas (las dependencias apuntan al dominio):
- domain: entidades, objetos de valor y excepciones de negocio. Sin dependencias a frameworks.
- application: puertos de entrada (casos de uso), puertos de salida (repositorios) y servicios.
- infrastructure: adaptadores de entrada (REST, DTOs, mappers) y salida (repositorios en memoria/JPA).

Dependencias permitidas:
infrastructure.adapter.in.rest ---> application.port.in ---> domain
infrastructure.adapter.out.persistence ---> application.port.out ---> domain
application.service ---> domain