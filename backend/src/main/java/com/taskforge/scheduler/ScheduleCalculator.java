package com.taskforge.scheduler;

import com.cronutils.model.Cron;
import com.cronutils.model.definition.CronDefinition;
import com.cronutils.model.definition.CronDefinitionBuilder;
import com.cronutils.model.time.ExecutionTime;
import com.cronutils.parser.CronParser;
import com.taskforge.entity.JobEntity;
import com.taskforge.enums.ScheduleType;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Optional;

import static com.cronutils.model.CronType.QUARTZ;
import static com.cronutils.model.CronType.SPRING;

@Component
public class ScheduleCalculator {

    private final CronParser cronParser;

    public ScheduleCalculator() {
        CronDefinition cronDefinition = CronDefinitionBuilder.instanceDefinitionFor(SPRING);
        this.cronParser = new CronParser(cronDefinition);
    }

    public Instant calculateNextRun(JobEntity job, Instant fromTime) {
        if (fromTime == null) fromTime = Instant.now();
        ZoneId zone = ZoneId.of(job.getTimeZone() != null ? job.getTimeZone() : "UTC");

        if (job.getScheduleType() == ScheduleType.ONE_TIME) {
            if (job.getStartTime() != null && job.getStartTime().isAfter(fromTime)) {
                return job.getStartTime();
            }
            return job.getNextRunAt() != null ? job.getNextRunAt() : fromTime;
        } else if (job.getScheduleType() == ScheduleType.FIXED_INTERVAL) {
            long intervalSec = job.getFixedIntervalSeconds() != null && job.getFixedIntervalSeconds() > 0
                    ? job.getFixedIntervalSeconds() : 60;
            return fromTime.plusSeconds(intervalSec);
        } else if (job.getScheduleType() == ScheduleType.CRON) {
            if (job.getCronExpression() == null || job.getCronExpression().trim().isEmpty()) {
                return fromTime.plusSeconds(60);
            }
            try {
                Cron cron = cronParser.parse(job.getCronExpression().trim());
                ExecutionTime executionTime = ExecutionTime.forCron(cron);
                ZonedDateTime zdt = ZonedDateTime.ofInstant(fromTime, zone);
                Optional<ZonedDateTime> nextZdt = executionTime.nextExecution(zdt);
                return nextZdt.map(dateTime -> dateTime.toInstant()).orElse(null);
            } catch (Exception e) {
                // Fallback for simple 5-field cron
                try {
                    CronDefinition unixDef = CronDefinitionBuilder.instanceDefinitionFor(com.cronutils.model.CronType.UNIX);
                    Cron cron = new CronParser(unixDef).parse(job.getCronExpression().trim());
                    ExecutionTime executionTime = ExecutionTime.forCron(cron);
                    ZonedDateTime zdt = ZonedDateTime.ofInstant(fromTime, zone);
                    return executionTime.nextExecution(zdt).map(dateTime -> dateTime.toInstant()).orElse(fromTime.plusSeconds(60));
                } catch (Exception ignored) {
                    return fromTime.plusSeconds(60);
                }
            }
        }
        return fromTime.plusSeconds(60);
    }
}
