package com.hoatv.exam.integrity.security;

/**
 * Thread-local context holding user session metadata.
 * Populated by {@link UserContextFilter} during request execution and cleared in finally block.
 */
public final class UserContext {

    private static final ThreadLocal<Integer> STUDENT_GRADE = new ThreadLocal<>();
    private static final ThreadLocal<String> USERNAME = new ThreadLocal<>();
    private static final ThreadLocal<Boolean> IS_STUDENT = new ThreadLocal<>();

    private UserContext() {}

    public static Integer getStudentGrade() {
        return STUDENT_GRADE.get();
    }

    public static void setStudentGrade(Integer grade) {
        if (grade == null) {
            STUDENT_GRADE.remove();
        } else {
            STUDENT_GRADE.set(grade);
        }
    }

    public static String getUsername() {
        return USERNAME.get();
    }

    public static void setUsername(String username) {
        if (username == null) {
            USERNAME.remove();
        } else {
            USERNAME.set(username);
        }
    }

    public static boolean isStudent() {
        return Boolean.TRUE.equals(IS_STUDENT.get());
    }

    public static void setStudent(boolean student) {
        IS_STUDENT.set(student);
    }

    public static void clear() {
        STUDENT_GRADE.remove();
        USERNAME.remove();
        IS_STUDENT.remove();
    }
}

