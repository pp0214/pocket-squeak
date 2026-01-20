/**
 * Unit tests for src/utils/helpers.ts
 */

import {
  safeJsonParse,
  escapeCSVField,
  calculateWeightChangePercent,
} from "../utils/helpers";

describe("safeJsonParse", () => {
  it("should parse valid JSON correctly", () => {
    expect(safeJsonParse('{"name": "test"}', {})).toEqual({ name: "test" });
    expect(safeJsonParse("[1, 2, 3]", [])).toEqual([1, 2, 3]);
    expect(safeJsonParse('"hello"', "")).toBe("hello");
    expect(safeJsonParse("123", 0)).toBe(123);
    expect(safeJsonParse("true", false)).toBe(true);
    expect(safeJsonParse("null", "default")).toBe(null);
  });

  it("should return fallback for invalid JSON", () => {
    expect(safeJsonParse("invalid json", [])).toEqual([]);
    expect(safeJsonParse("{broken", {})).toEqual({});
    expect(safeJsonParse("", "fallback")).toBe("fallback");
    expect(safeJsonParse("undefined", null)).toBe(null);
  });

  it("should return fallback for malformed JSON", () => {
    expect(safeJsonParse("{'single': 'quotes'}", {})).toEqual({});
    expect(safeJsonParse("[1, 2, 3,]", [])).toEqual([]); // trailing comma
    expect(safeJsonParse("{key: 'no quotes'}", {})).toEqual({});
  });

  it("should handle empty arrays and objects", () => {
    expect(safeJsonParse("[]", ["default"])).toEqual([]);
    expect(safeJsonParse("{}", { default: true })).toEqual({});
  });
});

describe("escapeCSVField", () => {
  describe("basic escaping", () => {
    it("should return simple strings unchanged", () => {
      expect(escapeCSVField("hello")).toBe("hello");
      expect(escapeCSVField("simple text")).toBe("simple text");
      expect(escapeCSVField("123")).toBe("123");
    });

    it("should wrap strings with commas in quotes", () => {
      expect(escapeCSVField("hello, world")).toBe('"hello, world"');
      expect(escapeCSVField("a,b,c")).toBe('"a,b,c"');
    });

    it("should escape embedded quotes by doubling them", () => {
      expect(escapeCSVField('say "hello"')).toBe('"say ""hello"""');
      expect(escapeCSVField('"quoted"')).toBe('"""quoted"""');
    });

    it("should wrap strings with newlines in quotes", () => {
      expect(escapeCSVField("line1\nline2")).toBe('"line1\nline2"');
      expect(escapeCSVField("line1\r\nline2")).toBe('"line1\r\nline2"');
    });
  });

  describe("CSV injection prevention", () => {
    it("should escape leading equals sign", () => {
      expect(escapeCSVField("=SUM(A1:A10)")).toBe('"\'=SUM(A1:A10)"');
    });

    it("should escape leading plus sign", () => {
      expect(escapeCSVField("+1234567890")).toBe('"\'+1234567890"');
    });

    it("should escape leading minus sign", () => {
      expect(escapeCSVField("-100")).toBe('"\'-100"');
    });

    it("should escape leading at sign", () => {
      expect(escapeCSVField("@username")).toBe('"\'@username"');
    });

    it("should escape leading tab character", () => {
      expect(escapeCSVField("\tindented")).toBe('"\'\tindented"');
    });

    it("should not escape safe leading characters", () => {
      expect(escapeCSVField("normal")).toBe("normal");
      expect(escapeCSVField("123")).toBe("123");
      expect(escapeCSVField(" space")).toBe(" space");
    });
  });

  describe("combined cases", () => {
    it("should handle quotes and commas together", () => {
      expect(escapeCSVField('Hello, "World"')).toBe('"Hello, ""World"""');
    });

    it("should handle injection attempt with comma", () => {
      expect(escapeCSVField("=cmd|' /C calc'!A0,B0")).toBe(
        "\"'=cmd|' /C calc'!A0,B0\"",
      );
    });
  });
});

describe("calculateWeightChangePercent", () => {
  describe("valid calculations", () => {
    it("should calculate positive weight change", () => {
      expect(calculateWeightChangePercent(110, 100)).toBeCloseTo(10);
      expect(calculateWeightChangePercent(150, 100)).toBeCloseTo(50);
    });

    it("should calculate negative weight change", () => {
      expect(calculateWeightChangePercent(90, 100)).toBeCloseTo(-10);
      expect(calculateWeightChangePercent(50, 100)).toBeCloseTo(-50);
    });

    it("should return 0 for no change", () => {
      expect(calculateWeightChangePercent(100, 100)).toBeCloseTo(0);
    });

    it("should handle decimal weights", () => {
      expect(calculateWeightChangePercent(350.5, 350)).toBeCloseTo(0.143, 2);
      expect(calculateWeightChangePercent(348.25, 350)).toBeCloseTo(-0.5, 1);
    });
  });

  describe("edge cases", () => {
    it("should return undefined for null current weight", () => {
      expect(calculateWeightChangePercent(null, 100)).toBeUndefined();
    });

    it("should return undefined for null previous weight", () => {
      expect(calculateWeightChangePercent(100, null)).toBeUndefined();
    });

    it("should return undefined for undefined values", () => {
      expect(calculateWeightChangePercent(undefined, 100)).toBeUndefined();
      expect(calculateWeightChangePercent(100, undefined)).toBeUndefined();
      expect(
        calculateWeightChangePercent(undefined, undefined),
      ).toBeUndefined();
    });

    it("should return undefined for zero previous weight (avoid division by zero)", () => {
      expect(calculateWeightChangePercent(100, 0)).toBeUndefined();
    });

    it("should handle zero current weight", () => {
      expect(calculateWeightChangePercent(0, 100)).toBeCloseTo(-100);
    });
  });
});
