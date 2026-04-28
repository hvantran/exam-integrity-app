package com.hoatv.exam.integrity.repositories;

import com.hoatv.exam.integrity.document.AuditEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditEventRepository extends MongoRepository<AuditEvent, String> {
    List<AuditEvent> findBySessionIdOrderByOccurredAtAsc(String sessionId);
}
