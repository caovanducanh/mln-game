package com.econgame.service;

import com.econgame.dto.GameDTO;
import com.econgame.entity.User;
import com.econgame.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public GameDTO.UserResponse toResponse(User user) {
        return GameDTO.UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .build();
    }

    public void makeAdmin(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setRole("ADMIN");
        userRepository.save(user);
    }
}
