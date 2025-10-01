package com.snapfit.api.entity;

/**
 * 게시판 타입 열거형
 */
public enum BoardType {
    OUTFIT("코디"),
    QUESTION("질문"),
    INFO("정보");

    private final String displayName;

    BoardType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
