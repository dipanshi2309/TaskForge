package com.taskforge.repository;

import com.taskforge.entity.WorkerInstanceEntity;
import com.taskforge.enums.WorkerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface WorkerInstanceRepository extends JpaRepository<WorkerInstanceEntity, String> {

    List<WorkerInstanceEntity> findByStatus(WorkerStatus status);

    @Modifying
    @Query("UPDATE WorkerInstanceEntity w SET w.status = 'OFFLINE' WHERE w.lastHeartbeat < :cutoff AND w.status != 'OFFLINE'")
    int markStaleWorkersOffline(@Param("cutoff") Instant cutoff);
}
