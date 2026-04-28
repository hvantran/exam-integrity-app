package com.hoatv.exam.integrity.repositories;

import com.hoatv.exam.integrity.domain.Score;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScoreRepository extends MongoRepository<Score, String> {
    List<Score> findBySessionId(String sessionId);
    List<Score> findBySessionIdAndStatus(String sessionId, Score.ScoreStatus status);
}
