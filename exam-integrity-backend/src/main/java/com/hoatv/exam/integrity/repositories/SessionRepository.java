package com.hoatv.exam.integrity.repositories;

import com.hoatv.exam.integrity.domain.ExamSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends MongoRepository<ExamSession, String> {
    Optional<ExamSession> findByStudentIdAndExamIdAndStatus(
        String studentId, String examId, ExamSession.SessionStatus status);
    List<ExamSession> findByExamId(String examId);
    List<ExamSession> findByStudentId(String studentId);
}
