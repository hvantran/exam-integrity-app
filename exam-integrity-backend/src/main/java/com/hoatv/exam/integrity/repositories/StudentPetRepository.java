package com.hoatv.exam.integrity.repositories;

import com.hoatv.exam.integrity.domain.StudentPet;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentPetRepository extends MongoRepository<StudentPet, String> {

    List<StudentPet> findByUserId(String userId);

    Optional<StudentPet> findByIdAndUserId(String id, String userId);
}

