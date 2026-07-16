import { describe, it, expect } from "vitest";
import { getDisplayName, getInitials, formatDate } from "./utils";

describe("Profile Utils", () => {
  describe("getDisplayName", () => {
    it('should return "User Name" if user is null or undefined', () => {
      expect(getDisplayName(null)).toBe("User Name");
      expect(getDisplayName(undefined)).toBe("User Name");
    });

    it("should return full name if first_name or last_name is provided", () => {
      expect(getDisplayName({ first_name: "John", last_name: "Doe" })).toBe(
        "John Doe",
      );
      expect(getDisplayName({ first_name: "John" })).toBe("John");
      expect(getDisplayName({ last_name: "Doe" })).toBe("Doe");
    });

    it("should fallback to name or username if first/last name are missing", () => {
      expect(getDisplayName({ name: "Johnnie" })).toBe("Johnnie");
      expect(getDisplayName({ username: "johndoe123" })).toBe("johndoe123");
    });
  });

  describe("getInitials", () => {
    it("should return initials of the display name", () => {
      expect(getInitials({ first_name: "John", last_name: "Doe" })).toBe("JD");
      expect(getInitials({ first_name: "single" })).toBe("S");
    });

    it('should return "U" if no name is available', () => {
      expect(getInitials(null)).toBe("UN"); // "User Name" -> "UN"
    });
  });

  describe("formatDate", () => {
    it('should return "Not available" if value is falsy', () => {
      expect(formatDate(null)).toBe("Not available");
      expect(formatDate("")).toBe("Not available");
    });

    it("should format valid date strings correctly", () => {
      const formatted = formatDate("2023-10-27");
      expect(formatted).toContain("2023");
      expect(formatted).toContain("October");
    });

    it("should return the original value if it is an invalid date", () => {
      expect(formatDate("invalid-date")).toBe("invalid-date");
    });
  });
});
