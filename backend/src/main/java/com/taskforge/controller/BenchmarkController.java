package com.taskforge.controller;

import com.taskforge.dto.BenchmarkRequest;
import com.taskforge.dto.BenchmarkResponse;
import com.taskforge.service.BenchmarkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/benchmark")
@RequiredArgsConstructor
@Tag(name = "Performance Lab", description = "Endpoints for running and inspecting performance stress benchmarks")
@CrossOrigin(origins = "*")
public class BenchmarkController {

    private final BenchmarkService benchmarkService;

    @PostMapping("/run")
    @Operation(summary = "Run a performance benchmark scenario")
    public BenchmarkResponse runBenchmark(@Valid @RequestBody BenchmarkRequest request) {
        return benchmarkService.runBenchmark(request);
    }

    @GetMapping("/history")
    @Operation(summary = "List recent benchmark executions")
    public List<BenchmarkResponse> getBenchmarkHistory() {
        return benchmarkService.getRecentRuns();
    }
}
