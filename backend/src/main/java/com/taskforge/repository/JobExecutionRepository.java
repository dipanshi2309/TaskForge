package com.taskforge.repository;

import com.taskforge.entity.JobExecutionEntity;
import com.taskforge.enums.ExecutionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface JobExecutionRepository extends JpaRepository<JobExecutionEntity, String> {

    Page<JobExecutionEntity> findByJobId(String jobId, Pageable pageable);

    @Query("SELECT e FROM JobExecutionEntity e WHERE " +
           "(:jobId IS NULL OR e.jobId = :jobId) AND " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:workerId IS NULL OR e.workerId = :workerId)")
    Page<JobExecutionEntity> searchExecutions(@Param("jobId") String jobId,
                                              @Param("status") ExecutionStatus status,
                                              @Param("workerId") String workerId,
                                              Pageable pageable);

    List<JobExecutionEntity> findTop10ByOrderByStartedAtDesc();

    List<JobExecutionEntity> findTop5ByStatusOrderByStartedAtDesc(ExecutionStatus status);

    long countByStatus(ExecutionStatus status);

    long countByStatusAndStartedAtAfter(ExecutionStatus status, Instant after);

    List<JobExecutionEntity> findByStatusAndStartedAtBefore(ExecutionStatus status, Instant cutoff);

    @Query("SELECT AVG(e.durationMs) FROM JobExecutionEntity e WHERE e.status = 'SUCCEEDED'")
    Double getAverageExecutionTimeMs();
}
