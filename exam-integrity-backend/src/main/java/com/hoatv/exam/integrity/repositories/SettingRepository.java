package com.hoatv.exam.integrity.repositories;

import com.hoatv.exam.integrity.domain.Setting;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SettingRepository extends MongoRepository<Setting, String> {
    Optional<Setting> findByKey(String key);
}

