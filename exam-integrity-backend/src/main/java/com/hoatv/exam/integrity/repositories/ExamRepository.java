package com.hoatv.exam.integrity.repositories;

import com.hoatv.exam.integrity.domain.Exam;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExamRepository extends MongoRepository<Exam, String> {
    List<Exam> findByStatus(Exam.ExamStatus status);
    List<Exam> findByUploadedBy(String uploadedBy);
    /** Returns all ACTIVE exams that contain ALL of the given tags. */
    List<Exam> findByStatusAndTagsIn(Exam.ExamStatus status, List<String> tags);
}
