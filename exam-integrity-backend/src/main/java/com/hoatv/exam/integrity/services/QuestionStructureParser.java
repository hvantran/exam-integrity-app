package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.dtos.QuestionPartDTO;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Builds a structured representation for labeled essay sub-questions. */
public final class QuestionStructureParser {

    private static final Pattern PART_PATTERN = Pattern.compile("^\\s*((?:[A-Za-z]|\\d+))[.)]\\s*(.+)\\s*$");
    private static final Pattern INLINE_LABEL_PATTERN = Pattern.compile("(?:^|\\s)([A-Za-z])[.)]\\s*");
    private static final Pattern FILLER_PATTERN = Pattern.compile("^[.\\s_…]+$");

    private QuestionStructureParser() {
    }

    public static ParsedQuestionContent parse(String content) {
        if (content == null || content.isBlank()) {
            return ParsedQuestionContent.empty();
        }

        String[] lines = content.replace("\r\n", "\n").split("\n");
        List<String> stemLines = new ArrayList<>();
        List<QuestionPartDTO> parts = new ArrayList<>();
        String currentKey = null;
        StringBuilder currentPrompt = null;
        boolean foundPart = false;

        for (String rawLine : lines) {
            String line = rawLine == null ? "" : rawLine.trim();

            List<QuestionPartDTO> inlineParts = extractInlineParts(line);
            if (!inlineParts.isEmpty()) {
                if (currentKey != null && currentPrompt != null) {
                    parts.add(new QuestionPartDTO(currentKey, currentPrompt.toString().trim()));
                }

                for (int i = 0; i < inlineParts.size() - 1; i++) {
                    parts.add(inlineParts.get(i));
                }

                QuestionPartDTO lastInlinePart = inlineParts.get(inlineParts.size() - 1);
                currentKey = lastInlinePart.key();
                currentPrompt = new StringBuilder(lastInlinePart.prompt());
                foundPart = true;
                continue;
            }

            Matcher matcher = PART_PATTERN.matcher(line);

            if (matcher.matches()) {
                if (currentKey != null && currentPrompt != null) {
                    parts.add(new QuestionPartDTO(currentKey, currentPrompt.toString().trim()));
                }
                currentKey = matcher.group(1);
                currentPrompt = new StringBuilder(matcher.group(2).trim());
                foundPart = true;
                continue;
            }

            if (!foundPart) {
                stemLines.add(rawLine);
                continue;
            }

            if (line.isBlank() || FILLER_PATTERN.matcher(line).matches()) {
                continue;
            }

            if (currentPrompt != null) {
                if (!currentPrompt.isEmpty()) {
                    currentPrompt.append(' ');
                }
                currentPrompt.append(line);
            }
        }

        if (currentKey != null && currentPrompt != null) {
            parts.add(new QuestionPartDTO(currentKey, currentPrompt.toString().trim()));
        }

        if (parts.size() < 2) {
            return ParsedQuestionContent.empty();
        }

        String stem = String.join("\n", stemLines).trim();
        return new ParsedQuestionContent(stem.isBlank() ? null : stem, parts);
    }

    public record ParsedQuestionContent(String stem, List<QuestionPartDTO> parts) {
        public static ParsedQuestionContent empty() {
            return new ParsedQuestionContent(null, List.of());
        }
    }

    private static List<QuestionPartDTO> extractInlineParts(String line) {
        if (line == null || line.isBlank()) {
            return List.of();
        }

        Matcher matcher = INLINE_LABEL_PATTERN.matcher(line);
        List<InlineLabel> labels = new ArrayList<>();
        while (matcher.find()) {
            labels.add(new InlineLabel(matcher.group(1), matcher.start(), matcher.end()));
        }

        if (labels.size() < 2) {
            return List.of();
        }

        List<QuestionPartDTO> parts = new ArrayList<>();
        for (int i = 0; i < labels.size(); i++) {
            InlineLabel current = labels.get(i);
            int promptStart = current.contentStart();
            int promptEnd = i + 1 < labels.size() ? labels.get(i + 1).labelStart() : line.length();

            String prompt = line.substring(promptStart, promptEnd).trim();
            if (!prompt.isBlank()) {
                parts.add(new QuestionPartDTO(current.key(), prompt));
            }
        }

        return parts.size() >= 2 ? parts : List.of();
    }

    private record InlineLabel(String key, int labelStart, int contentStart) {
    }
}