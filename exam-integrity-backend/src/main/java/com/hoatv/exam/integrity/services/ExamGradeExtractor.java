package com.hoatv.exam.integrity.services;

import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utility for extracting grade numbers from exam tags.
 * Normalizes tags by trimming, lowering case, and removing spaces, then strictly matches the "grade" pattern.
 */
public final class ExamGradeExtractor {

    private static final Pattern GRADE_PATTERN = Pattern.compile("^grade(\\d+)$");

    private ExamGradeExtractor() {}

    /**
     * Extracts an integer grade from a single tag if it matches the grade pattern (e.g. "grade 4", "grade4" -> 4).
     */
    public static Integer extractGradeFromTag(String tag) {
        if (tag == null) {
            return null;
        }
        String clean = tag.toLowerCase(Locale.ROOT).trim().replace(" ", "");
        Matcher matcher = GRADE_PATTERN.matcher(clean);
        if (matcher.matches()) {
            try {
                return Integer.parseInt(matcher.group(1));
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    /**
     * Extracts the first recognized grade integer from a list of tags.
     */
    public static Integer extractGradeFromTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return null;
        }
        for (String tag : tags) {
            Integer grade = extractGradeFromTag(tag);
            if (grade != null) {
                return grade;
            }
        }
        return null;
    }

    /**
     * Checks whether an exam's tags match the given target grade.
     */
    public static boolean matchesGrade(List<String> tags, Integer targetGrade) {
        if (targetGrade == null) {
            return true;
        }
        Integer tagGrade = extractGradeFromTags(tags);
        return targetGrade.equals(tagGrade);
    }
}

