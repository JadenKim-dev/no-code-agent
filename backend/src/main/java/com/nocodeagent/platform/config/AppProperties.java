package com.nocodeagent.platform.config;

import java.nio.file.Path;
import java.util.List;
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

    public static class Storage {
        private Path dataDir = Path.of("./data");

        public Path getDataDir() {
            return dataDir;
        }

        public void setDataDir(Path dataDir) {
            this.dataDir = dataDir;
        }
    }

    public static class Cors {
        private List<String> allowedOrigins = List.of("http://localhost:5173");

        public List<String> getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(List<String> allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }
}
