package com.hoatv.exam.integrity.repositories;

import com.hoatv.exam.integrity.domain.Question;
import com.hoatv.exam.integrity.domain.QuestionBankItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionBankRepository extends MongoRepository<QuestionBankItem, String> {
    Optional<QuestionBankItem> findByContentHash(String contentHash);
    Page<QuestionBankItem> findByType(Question.QuestionType type, Pageable pageable);
    Page<QuestionBankItem> findByTagsIn(List<String> tags, Pageable pageable);
    Page<QuestionBankItem> findByTypeAndTagsIn(Question.QuestionType type, List<String> tags, Pageable pageable);

    @Query("{ content: { $regex: ?0, $options: 'i' } }")
    Page<QuestionBankItem> searchByText(String query, Pageable pageable);

    @Query("{ content: { $regex: ?0, $options: 'i' }, type: ?1 }")
    Page<QuestionBankItem> searchByTextAndType(String query, Question.QuestionType type, Pageable pageable);

    @Query("{ content: { $regex: ?0, $options: 'i' }, tags: { $in: ?1 } }")
    Page<QuestionBankItem> searchByTextAndTags(String query, List<String> tags, Pageable pageable);

    @Query("{ content: { $regex: ?0, $options: 'i' }, type: ?1, tags: { $in: ?2 } }")
    Page<QuestionBankItem> searchByTextTypeAndTags(String query, Question.QuestionType type, List<String> tags, Pageable pageable);
}
