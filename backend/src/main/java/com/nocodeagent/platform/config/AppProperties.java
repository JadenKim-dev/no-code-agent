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
        private Path agentsDir = Path.of("./data/agents");
        private Path schedulesFile = Path.of("./data/schedules/schedules.json");

        public Path getAgentsDir() {
            return agentsDir;
        }

        public void setAgentsDir(Path agentsDir) {
            this.agentsDir = agentsDir;
        }

        public Path getSchedulesFile() {
            return schedulesFile;
        }

        public void setSchedulesFile(Path schedulesFile) {
            this.schedulesFile = schedulesFile;
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
