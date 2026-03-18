package com.nocodeagent.platform.agent.common;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class StringListConverterTest {

    private final StringListConverter converter = new StringListConverter();

    @Test
    void convertsListToCommaSeparatedString() {
        assertThat(converter.convertToDatabaseColumn(List.of("a", "b", "c"))).isEqualTo("a,b,c");
    }

    @Test
    void convertsNullListToNull() {
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
    }

    @Test
    void convertsCommaSeparatedStringToList() {
        assertThat(converter.convertToEntityAttribute("a,b,c")).containsExactly("a", "b", "c");
    }

    @Test
    void convertsNullStringToEmptyList() {
        assertThat(converter.convertToEntityAttribute(null)).isEmpty();
    }

    @Test
    void convertsBlankStringToEmptyList() {
        assertThat(converter.convertToEntityAttribute("")).isEmpty();
    }
}
