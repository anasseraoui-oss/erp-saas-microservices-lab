package com.eraoui.Processor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@Slf4j
public class NotificationProcessorFactory {

    private final Map<String, NotificationProcessor> processorMap;
    private final NotificationProcessor defaultProcessor;

    @Autowired
    public NotificationProcessorFactory(List<NotificationProcessor> processors) {
        this.processorMap = processors.stream()
                .filter(processor -> !(processor instanceof DefaultNotificationProcessor))
                .collect(Collectors.toMap(
                        processor -> processor.getSupportedTopic(),
                        Function.identity()
                ));

        this.defaultProcessor = processors.stream()
                .filter(processor -> processor instanceof DefaultNotificationProcessor)
                .findFirst()
                .orElse(new DefaultNotificationProcessor());

        log.info("Initialized NotificationProcessorFactory with {} processors", processorMap.size());
        processorMap.keySet().forEach(topic ->
                log.debug("Registered processor for topic: {}", topic));
    }

    public NotificationProcessor getProcessor(String topic) {
        NotificationProcessor processor = processorMap.get(topic);
        if (processor != null) {
            log.debug("Found specific processor for topic: {}", topic);
            return processor;
        }

        log.debug("Using default processor for topic: {}", topic);
        return defaultProcessor;
    }
}