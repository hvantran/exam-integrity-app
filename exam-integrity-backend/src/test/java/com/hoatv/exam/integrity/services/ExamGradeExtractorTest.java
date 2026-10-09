package com.hoatv.exam.integrity.services;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ExamGradeExtractorTest {

    @Test
    void extractGradeFromTagParsesValidGradeFormats() {
        assertThat(ExamGradeExtractor.extractGradeFromTag("grade 4")).isEqualTo(4);
        assertThat(ExamGradeExtractor.extractGradeFromTag("grade4")).isEqualTo(4);
        assertThat(ExamGradeExtractor.extractGradeFromTag("GRADE 1")).isEqualTo(1);
        assertThat(ExamGradeExtractor.extractGradeFromTag("  grade   12  ")).isEqualTo(12);
        assertThat(ExamGradeExtractor.extractGradeFromTag("Grade 10")).isEqualTo(10);
    }

    @Test
    void extractGradeFromTagReturnsNullForNonGradeOrInvalidFormats() {
        assertThat(ExamGradeExtractor.extractGradeFromTag("math")).isNull();
        assertThat(ExamGradeExtractor.extractGradeFromTag("lop 4")).isNull();
        assertThat(ExamGradeExtractor.extractGradeFromTag("grade")).isNull();
        assertThat(ExamGradeExtractor.extractGradeFromTag("gradex")).isNull();
        assertThat(ExamGradeExtractor.extractGradeFromTag(null)).isNull();
        assertThat(ExamGradeExtractor.extractGradeFromTag("")).isNull();
    }

    @Test
    void extractGradeFromTagsFindsFirstValidGradeTag() {
        assertThat(ExamGradeExtractor.extractGradeFromTags(List.of("math", "grade 4"))).isEqualTo(4);
        assertThat(ExamGradeExtractor.extractGradeFromTags(List.of("grade 1", "science"))).isEqualTo(1);
        assertThat(ExamGradeExtractor.extractGradeFromTags(List.of("math", "science"))).isNull();
        assertThat(ExamGradeExtractor.extractGradeFromTags(null)).isNull();
        assertThat(ExamGradeExtractor.extractGradeFromTags(List.of())).isNull();
    }

    @Test
    void matchesGradeValidatesCorrectly() {
        List<String> grade4Tags = List.of("math", "grade 4");
        assertThat(ExamGradeExtractor.matchesGrade(grade4Tags, 4)).isTrue();
        assertThat(ExamGradeExtractor.matchesGrade(grade4Tags, 1)).isFalse();
        assertThat(ExamGradeExtractor.matchesGrade(grade4Tags, null)).isTrue();

        List<String> noGradeTags = List.of("math");
        assertThat(ExamGradeExtractor.matchesGrade(noGradeTags, 4)).isFalse();
    }
}

