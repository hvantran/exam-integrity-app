package com.hoatv.exam.integrity.repositories;

import com.hoatv.exam.integrity.domain.StudentItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentItemRepository extends MongoRepository<StudentItem, String> {

    List<StudentItem> findByUserId(String userId);

    List<StudentItem> findByCategory(String category);

    List<StudentItem> findByUserIdAndCategory(String userId, String category);

    Optional<StudentItem> findByIdAndUserId(String id, String userId);

    Optional<StudentItem> findByIdAndUserIdAndCategory(String id, String userId, String category);

    void deleteByIdAndUserId(String id, String userId);

    void deleteByIdAndUserIdAndCategory(String id, String userId, String category);
}

