import { describe, it, expect } from "vitest";
import {
  getAccessibleTables,
  getRoleLabel,
  getDepartmentLabel,
} from "./rolesPermissions.constants";

describe("Roles & Permissions Constants & Utils", () => {
  describe("getAccessibleTables", () => {
    it("should return empty set if no role is provided", () => {
      const result = getAccessibleTables(null, null);
      expect(result.size).toBe(0);
    });

    it("should return all tables for owner or admin", () => {
      const ownerResult = getAccessibleTables("owner", null);
      const adminResult = getAccessibleTables("admin", null);
      expect(ownerResult.has("employees")).toBe(true);
      expect(ownerResult.has("products")).toBe(true);
      expect(adminResult.has("employees")).toBe(true);
      expect(adminResult.has("products")).toBe(true);
    });

    it("should return specific tables for hr_manager", () => {
      const result = getAccessibleTables("hr_manager", null);
      expect(result.has("employees")).toBe(true);
      expect(result.has("attendance")).toBe(true);
      expect(result.has("products")).toBe(false);
    });

    it("should return specific tables for employee based on department", () => {
      const hrEmployee = getAccessibleTables("employee", "hr");
      expect(hrEmployee.has("employees")).toBe(true);
      expect(hrEmployee.has("products")).toBe(false);

      const salesEmployee = getAccessibleTables("employee", "sales");
      expect(salesEmployee.has("customers")).toBe(true);
      expect(salesEmployee.has("employees")).toBe(false);
    });
  });

  describe("getRoleLabel", () => {
    it("should return correct labels", () => {
      expect(getRoleLabel("owner")).toBe("Owner");
      expect(getRoleLabel("admin")).toBe("Admin");
      expect(getRoleLabel("hr_manager")).toBe("HR Manager");
      expect(getRoleLabel("employee")).toBe("Employee");
      expect(getRoleLabel(null)).toBe("");
    });
  });

  describe("getDepartmentLabel", () => {
    it("should map department codes to labels", () => {
      expect(getDepartmentLabel("hr")).toBe("HR");
      expect(getDepartmentLabel("inventory")).toBe("Inventory");
      expect(getDepartmentLabel("sales")).toBe("Sales");
      expect(getDepartmentLabel("unknown")).toBe("unknown");
    });
  });
});
