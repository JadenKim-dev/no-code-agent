package com.nocodeagent.platform.config;

import java.nio.file.Path;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Storage storage = new Storage();
    private final Cors cors = new Cors();

    public Storage getStorage() {
        return storage;
    }

    public Cors getCors() {
        return cors;
    }

    @Getter
    @Setter
    public static class Storage {
        private Path dataDir = Path.of("./data");
    }

    @Getter
    @Setter
    public static class Cors {
        private List<String> allowedOrigins = List.of("http://localhost:5173");
    }
}
