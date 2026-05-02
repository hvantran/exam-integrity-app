package com.hoatv.exam.integrity.services;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class QuestionStructureParserTest {

    @Test
    void parsesLabeledEssayPartsIntoStructuredContent() {
        String content = "Tính giá trị của biểu thức:\n"
            + "a) 12 523 + 20 492 : 4\n"
            + "b) (15 320 – 3 105) x 8\n"
            + "....................................................";

        QuestionStructureParser.ParsedQuestionContent parsed = QuestionStructureParser.parse(content);

        assertEquals("Tính giá trị của biểu thức:", parsed.stem());
        assertEquals(2, parsed.parts().size());
        assertEquals("a", parsed.parts().get(0).key());
        assertEquals("12 523 + 20 492 : 4", parsed.parts().get(0).prompt());
        assertEquals("b", parsed.parts().get(1).key());
        assertEquals("(15 320 – 3 105) x 8", parsed.parts().get(1).prompt());
    }

    @Test
    void parsesInlineLabeledEssayPartsIntoStructuredContent() {
        String content = """
        Đặt tính rồi tính
 a) 21 607 x 4                    b) 40 096 : 7
 …………..…………..…………..…………..
 …………..…………..…………..…………..
 …………..…………..…………..…………..
        """;

        QuestionStructureParser.ParsedQuestionContent parsed = QuestionStructureParser.parse(content);

        assertEquals("Đặt tính rồi tính", parsed.stem());
        assertEquals(2, parsed.parts().size());
        assertEquals("a", parsed.parts().get(0).key());
        assertEquals("21 607 x 4", parsed.parts().get(0).prompt());
        assertEquals("b", parsed.parts().get(1).key());
        assertEquals("40 096 : 7", parsed.parts().get(1).prompt());
    }

    @Test
    void parsesUnlabeledArithmeticPairsIntoStructuredContent() {
        String content = """
                Đặt tính rồi tính.
4 722 + 5 369                                            14 751 – 10 162
……..………..………………..……..………..………………..
……..………..………………..……..………..………………..
……..………..………………..……..………..………………..
27 108 x 8                                                   57 708 : 3
……..………..………………..……..………..………………..
……..………..………………..……..………..………………..
……..………..………………..……..………..………………..
                """;

        QuestionStructureParser.ParsedQuestionContent parsed = QuestionStructureParser.parse(content);

        assertEquals("Đặt tính rồi tính.", parsed.stem());
        assertEquals(4, parsed.parts().size());
        assertEquals("1", parsed.parts().get(0).key());
        assertEquals("4 722 + 5 369", parsed.parts().get(0).prompt());
        assertEquals("2", parsed.parts().get(1).key());
        assertEquals("14 751 – 10 162", parsed.parts().get(1).prompt());
        assertEquals("3", parsed.parts().get(2).key());
        assertEquals("27 108 x 8", parsed.parts().get(2).prompt());
        assertEquals("4", parsed.parts().get(3).key());
        assertEquals("57 708 : 3", parsed.parts().get(3).prompt());
    }

    @Test
    void ignoresSingleLabeledLineToAvoidFalsePositives() {
        QuestionStructureParser.ParsedQuestionContent parsed =
            QuestionStructureParser.parse("a) Chứng minh đẳng thức sau");

        assertTrue(parsed.parts().isEmpty());
    }
}
