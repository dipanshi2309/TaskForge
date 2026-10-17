package com.taskforge.repository;

import com.taskforge.entity.JobEntity;
import com.taskforge.enums.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<JobEntity, String> {

    Page<JobEntity> findByStatus(JobStatus status, Pageable pageable);

    @Query("SELECT j FROM JobEntity j WHERE " +
           "(:status IS NULL OR j.status = :status) AND " +
           "(:search IS NULL OR LOWER(j.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(j.id) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<JobEntity> searchJobs(@Param("status") JobStatus status,
                               @Param("search") String search,
                               Pageable pageable);

    @Query("SELECT j FROM JobEntity j WHERE j.status = 'SCHEDULED' AND j.nextRunAt <= :now ORDER BY j.priority DESC, j.nextRunAt ASC")
    List<JobEntity> findEligibleJobsToSchedule(@Param("now") Instant now, Pageable pageable);

    long countByStatus(JobStatus status);

    List<JobEntity> findTop5ByStatusOrderByNextRunAtAsc(JobStatus status);
}
