package com.hospital.emergency.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class DemoGenerateDto {

    @Min(value = 1, message = "Must generate at least 1 demo patient")
    @Max(value = 50, message = "Cannot generate more than 50 demo patients at once")
    private int count = 6;

    private boolean clearExisting = false;

    public DemoGenerateDto() {
    }

    public DemoGenerateDto(int count, boolean clearExisting) {
        this.count = count;
        this.clearExisting = clearExisting;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public boolean isClearExisting() {
        return clearExisting;
    }

    public void setClearExisting(boolean clearExisting) {
        this.clearExisting = clearExisting;
    }
}
