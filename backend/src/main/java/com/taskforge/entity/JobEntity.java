package com.taskforge.entity;

import com.taskforge.enums.JobPriority;
import com.taskforge.enums.JobStatus;
import com.taskforge.enums.ScheduleType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "jobs", indexes = {
    @Index(name = "idx_jobs_status", columnList = "status"),
    @Index(name = "idx_jobs_next_run", columnList = "next_run_at"),
    @Index(name = "idx_jobs_priority", columnList = "priority")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 100)
    private String taskType;

    @Column(columnDefinition = "TEXT")
    private String payload;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ScheduleType scheduleType;

    @Column(length = 100)
    private String cronExpression;

    private Long fixedIntervalSeconds;

    private Instant startTime;

    private Instant endTime;

    @Column(nullable = false, length = 60)
    @Builder.Default
    private String timeZone = "UTC";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private JobPriority priority = JobPriority.NORMAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private JobStatus status = JobStatus.SCHEDULED;

    @Column(nullable = false)
    @Builder.Default
    private Integer maxRetries = 3;

    @Column(nullable = false)
    @Builder.Default
    private Integer retryBackoffSeconds = 5;

    @Column(nullable = false)
    @Builder.Default
    private Boolean retryExponential = true;

    @Column(nullable = false)
    @Builder.Default
    private Integer timeoutSeconds = 60;

    @Column(nullable = false, length = 80)
    @Builder.Default
    private String targetQueue = "taskforge.jobs.default";

    private Instant nextRunAt;

    private Instant lastRunAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "job_dependencies", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "depends_on_job_id")
    @Builder.Default
    private List<String> dependencyJobIds = new ArrayList<>();

    @Version
    private Long version;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
