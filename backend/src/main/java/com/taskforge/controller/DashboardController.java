package com.taskforge.controller;

import com.taskforge.dto.DashboardOverviewResponse;
import com.taskforge.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard Metrics", description = "Endpoints for aggregated overview charts, stats and queue depths")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/overview")
    @Operation(summary = "Get aggregated dashboard metrics")
    public DashboardOverviewResponse getOverview() {
        return dashboardService.getOverview();
    }
}
