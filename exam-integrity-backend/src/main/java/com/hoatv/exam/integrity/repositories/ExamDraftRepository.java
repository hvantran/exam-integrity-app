package com.hoatv.exam.integrity.repositories;

import com.hoatv.exam.integrity.domain.ExamDraft;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExamDraftRepository extends MongoRepository<ExamDraft, String> {
    List<ExamDraft> findByUploadedBy(String uploadedBy);
    List<ExamDraft> findByStatus(ExamDraft.DraftStatus status);
    List<ExamDraft> findByUploadedByAndStatus(String uploadedBy, ExamDraft.DraftStatus status);
}
