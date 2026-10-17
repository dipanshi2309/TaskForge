package com.taskforge.repository;

import com.taskforge.entity.BenchmarkRunEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BenchmarkRunRepository extends JpaRepository<BenchmarkRunEntity, String> {
    List<BenchmarkRunEntity> findTop10ByOrderByRunAtDesc();
}
