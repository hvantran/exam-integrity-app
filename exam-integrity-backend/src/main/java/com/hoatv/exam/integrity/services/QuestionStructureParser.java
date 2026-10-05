package com.hoatv.exam.integrity.services;

import com.hoatv.exam.integrity.dtos.QuestionPartDTO;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Builds a structured representation for labeled essay sub-questions. */
public final class QuestionStructureParser {

    private static final Pattern PART_PATTERN = Pattern.compile("^([A-Za-z]|\\d+)[.),]\\s*(\\S.*)$");
    private static final Pattern INLINE_LABEL_PATTERN = Pattern.compile("(?:^|\\s)([A-Za-z])[.),]\\s*");
    private static final Pattern FILLER_PATTERN = Pattern.compile("^[.\\s_…]+$");
    private static final Pattern DUAL_PART_SPLIT = Pattern.compile("\\s{3,}");
    private static final Pattern ARITHMETIC_OP = Pattern.compile("[+\\-–xX×:÷]");

    private QuestionStructureParser() {
    }

    public static ParsedQuestionContent parse(String content) {
        if (content == null || content.isBlank()) {
            return ParsedQuestionContent.empty();
        }

        String[] lines = content.replace("\r\n", "\n").split("\n");
        ParseContext ctx = new ParseContext();

        for (String rawLine : lines) {
            processLine(rawLine, ctx);
        }

        ctx.flushCurrentPart();

        if (ctx.parts.size() < 2) {
            return ParsedQuestionContent.empty();
        }

        String stem = String.join("\n", ctx.stemLines).trim();
        return new ParsedQuestionContent(stem.isBlank() ? null : stem, ctx.parts);
    }

    private static void processLine(String rawLine, ParseContext ctx) {
        String line = rawLine == null ? "" : rawLine.trim();

        if (processInlineParts(line, ctx) || processUnlabeledParts(line, ctx) || processLabeledPart(line, ctx)) {
            return;
        }

        if (!ctx.foundPart) {
            ctx.stemLines.add(rawLine);
        } else if (!line.isBlank() && !FILLER_PATTERN.matcher(line).matches()) {
            ctx.appendToCurrentPrompt(line);
        }
    }

    private static boolean processInlineParts(String line, ParseContext ctx) {
        List<QuestionPartDTO> inlineParts = extractInlineParts(line);
        if (inlineParts.isEmpty()) {
            return false;
        }

        ctx.flushCurrentPart();
        for (int i = 0; i < inlineParts.size() - 1; i++) {
            ctx.parts.add(inlineParts.get(i));
        }

        QuestionPartDTO lastInlinePart = inlineParts.get(inlineParts.size() - 1);
        ctx.currentKey = lastInlinePart.key();
        ctx.currentPrompt = new StringBuilder(lastInlinePart.prompt());
        ctx.foundPart = true;
        return true;
    }

    private static boolean processUnlabeledParts(String line, ParseContext ctx) {
        List<QuestionPartDTO> unlabeledParts = extractUnlabeledDualParts(line, ctx.parts.size() + 1);
        if (!unlabeledParts.isEmpty() && (ctx.unlabeledMode || (!ctx.foundPart && ctx.currentKey == null))) {
            ctx.flushCurrentPart();
            ctx.parts.addAll(unlabeledParts);
            ctx.foundPart = true;
            ctx.unlabeledMode = true;
            return true;
        }
        return false;
    }

    private static boolean processLabeledPart(String line, ParseContext ctx) {
        Matcher matcher = PART_PATTERN.matcher(line);
        if (matcher.matches()) {
            ctx.flushCurrentPart();
            ctx.currentKey = matcher.group(1);
            ctx.currentPrompt = new StringBuilder(matcher.group(2).trim());
            ctx.foundPart = true;
            return true;
        }
        return false;
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

        if (labels.size() < 2 || !isValidLabelSequence(labels)) {
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

    private static boolean isValidLabelSequence(List<InlineLabel> labels) {
        if (labels.isEmpty()) {
            return false;
        }

        char firstChar = labels.get(0).key().charAt(0);
        if (Character.isLetter(firstChar)) {
            return isValidLetterSequence(labels, Character.toLowerCase(firstChar));
        }
        if (Character.isDigit(firstChar)) {
            return isValidDigitSequence(labels, Character.getNumericValue(firstChar));
        }
        return false;
    }

    private static boolean isValidLetterSequence(List<InlineLabel> labels, char firstChar) {
        for (int i = 0; i < labels.size(); i++) {
            String key = labels.get(i).key();
            if (key.length() != 1 || !Character.isLetter(key.charAt(0))) {
                return false;
            }
            char expected = (char) (firstChar + i);
            if (Character.toLowerCase(key.charAt(0)) != expected) {
                return false;
            }
        }
        return true;
    }

    private static boolean isValidDigitSequence(List<InlineLabel> labels, int firstNum) {
        for (int i = 0; i < labels.size(); i++) {
            String key = labels.get(i).key();
            if (key.isEmpty() || !Character.isDigit(key.charAt(0))) {
                return false;
            }
            int expected = firstNum + i;
            if (Character.getNumericValue(key.charAt(0)) != expected) {
                return false;
            }
        }
        return true;
    }

    private record InlineLabel(String key, int labelStart, int contentStart) {
    }

    private static List<QuestionPartDTO> extractUnlabeledDualParts(String line, int startIndex) {
        if (line == null || line.isBlank() || FILLER_PATTERN.matcher(line).matches()) {
            return List.of();
        }

        String[] split = DUAL_PART_SPLIT.split(line);
        if (split.length != 2) {
            return List.of();
        }

        String leftPrompt = split[0].trim();
        String rightPrompt = split[1].trim();
        if (leftPrompt.isBlank() || rightPrompt.isBlank()
            || !ARITHMETIC_OP.matcher(leftPrompt).find() || !ARITHMETIC_OP.matcher(rightPrompt).find()) {
            return List.of();
        }

        return List.of(
            new QuestionPartDTO(String.valueOf(startIndex), leftPrompt),
            new QuestionPartDTO(String.valueOf(startIndex + 1), rightPrompt)
        );
    }

    private static class ParseContext {
        final List<String> stemLines = new ArrayList<>();
        final List<QuestionPartDTO> parts = new ArrayList<>();
        String currentKey = null;
        StringBuilder currentPrompt = null;
        boolean foundPart = false;
        boolean unlabeledMode = false;

        void flushCurrentPart() {
            if (currentKey != null && currentPrompt != null) {
                parts.add(new QuestionPartDTO(currentKey, currentPrompt.toString().trim()));
                currentKey = null;
                currentPrompt = null;
            }
        }

        void appendToCurrentPrompt(String line) {
            if (currentPrompt != null) {
                if (!currentPrompt.isEmpty()) {
                    currentPrompt.append(' ');
                }
                currentPrompt.append(line);
            }
        }
    }
}