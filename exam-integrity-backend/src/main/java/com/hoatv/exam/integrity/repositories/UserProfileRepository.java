package com.hoatv.exam.integrity.repositories;

import com.hoatv.exam.integrity.domain.UserProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends MongoRepository<UserProfile, String> {

    Optional<UserProfile> findByUserId(String userId);

    boolean existsByUserId(String userId);
}

