package com.hoatv.exam.integrity.domain;

public class UserProfileStats {

    private int totalStars;
    private int completedExams;
    private double highestScore10;

    public UserProfileStats() {}

    public UserProfileStats(int totalStars, int completedExams, double highestScore10) {
        this.totalStars = totalStars;
        this.completedExams = completedExams;
        this.highestScore10 = highestScore10;
    }

    public int getTotalStars() {
        return totalStars;
    }

    public void setTotalStars(int totalStars) {
        this.totalStars = totalStars;
    }

    public int getCompletedExams() {
        return completedExams;
    }

    public void setCompletedExams(int completedExams) {
        this.completedExams = completedExams;
    }

    public double getHighestScore10() {
        return highestScore10;
    }

    public void setHighestScore10(double highestScore10) {
        this.highestScore10 = highestScore10;
    }
}

