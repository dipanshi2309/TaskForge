package com.taskforge.controller;

import com.taskforge.dto.JobRequest;
import com.taskforge.dto.JobResponse;
import com.taskforge.enums.JobStatus;
import com.taskforge.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Tag(name = "Job Management", description = "Endpoints for creating, managing, pausing, resuming and triggering jobs")
@CrossOrigin(origins = "*")
public class JobController {

    private final JobService jobService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new job")
    public JobResponse createJob(@Valid @RequestBody JobRequest request) {
        return jobService.createJob(request);
    }

    @GetMapping
    @Operation(summary = "List jobs with filtering and pagination")
    public Page<JobResponse> getJobs(
            @RequestParam(required = false) JobStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        return jobService.getJobs(status, search, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get job details by ID")
    public JobResponse getJobById(@PathVariable String id) {
        return jobService.getJobById(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing job")
    public JobResponse updateJob(@PathVariable String id, @Valid @RequestBody JobRequest request) {
        return jobService.updateJob(id, request);
    }

    @PostMapping("/{id}/pause")
    @Operation(summary = "Pause a scheduled job")
    public JobResponse pauseJob(@PathVariable String id) {
        return jobService.pauseJob(id);
    }

    @PostMapping("/{id}/resume")
    @Operation(summary = "Resume a paused job")
    public JobResponse resumeJob(@PathVariable String id) {
        return jobService.resumeJob(id);
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel a job")
    public JobResponse cancelJob(@PathVariable String id) {
        return jobService.cancelJob(id);
    }

    @PostMapping("/{id}/trigger")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Operation(summary = "Trigger a job execution immediately")
    public void triggerNow(@PathVariable String id) {
        jobService.triggerNow(id);
    }
}
