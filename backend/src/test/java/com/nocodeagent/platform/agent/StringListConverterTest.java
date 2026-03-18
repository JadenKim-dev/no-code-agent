package com.nocodeagent.platform.agent;

import java.util.List;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class StringListConverterTest {

    private final StringListConverter converter = new StringListConverter();

    @Test
    void convertToDatabaseColumn_joinWithComma() {
        assertThat(converter.convertToDatabaseColumn(List.of("web_search", "calculator")))
            .isEqualTo("web_search,calculator");
    }

    @Test
    void convertToDatabaseColumn_emptyList_returnsEmptyString() {
        assertThat(converter.convertToDatabaseColumn(List.of())).isEqualTo("");
    }

    @Test
    void convertToDatabaseColumn_null_returnsNull() {
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
    }

    @Test
    void convertToEntityAttribute_splitByComma() {
        assertThat(converter.convertToEntityAttribute("web_search,calculator"))
            .containsExactly("web_search", "calculator");
    }

    @Test
    void convertToEntityAttribute_emptyString_returnsEmptyList() {
        assertThat(converter.convertToEntityAttribute("")).isEmpty();
    }

    @Test
    void convertToEntityAttribute_null_returnsEmptyList() {
        assertThat(converter.convertToEntityAttribute(null)).isEmpty();
    }
}
