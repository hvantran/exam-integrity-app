package com.hoatv.exam.integrity.repositories;

import com.hoatv.exam.integrity.domain.IncubatingEgg;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IncubatingEggRepository extends MongoRepository<IncubatingEgg, String> {

    List<IncubatingEgg> findByUserId(String userId);

    Optional<IncubatingEgg> findByIdAndUserId(String id, String userId);

    void deleteByIdAndUserId(String id, String userId);
}

