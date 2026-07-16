import { describe, it, expect } from "vitest";
import { calculateOvertime } from "./attendance";

describe("calculateOvertime", () => {
  it("should return dash if checkIn or checkOut is missing", () => {
    expect(calculateOvertime(null, "17:00")).toBe("—");
    expect(calculateOvertime("09:00", null)).toBe("—");
  });

  it("should return dash for invalid time formats", () => {
    expect(calculateOvertime("invalid", "17:00")).toBe("—");
    expect(calculateOvertime("09:00", "invalid")).toBe("—");
  });

  it('should return "0h" if total hours worked is 8 hours or less', () => {
    expect(calculateOvertime("09:00", "17:00")).toBe("0h"); // exactly 8 hours
    expect(calculateOvertime("09:00", "16:00")).toBe("0h"); // 7 hours
  });

  it("should calculate correct overtime in hours and minutes", () => {
    expect(calculateOvertime("09:00", "19:00")).toBe("2h"); // 10 hours total -> 2h overtime
    expect(calculateOvertime("09:00", "19:30")).toBe("2h30m"); // 10.5 hours total -> 2h30m overtime
    expect(calculateOvertime("08:30", "18:45")).toBe("2h15m"); // 10h15m total -> 2h15m overtime
  });
});
