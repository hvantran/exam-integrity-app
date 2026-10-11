package com.hoatv.exam.integrity.repositories;

import com.hoatv.exam.integrity.domain.PetLibraryItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PetLibraryRepository extends MongoRepository<PetLibraryItem, String> {

    Optional<PetLibraryItem> findByPetKey(String petKey);
}

