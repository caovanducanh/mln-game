package com.econgame.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String name;

    private String avatarUrl;

    @Column(nullable = false)
    @Builder.Default
    private String role = "PLAYER";

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
