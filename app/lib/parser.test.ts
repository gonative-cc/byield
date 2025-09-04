import { describe, test, expect } from "vitest";
import { extractFirstInteger, extractFirstNumber } from "./parser";

describe("extractFirstInteger", () => {
	test("should extract positive integers", () => {
		expect(extractFirstInteger("Room 101")).toBe(101);
		expect(extractFirstInteger("The answer is 42")).toBe(42);
		expect(extractFirstInteger("abc123def")).toBe(123);
		expect(extractFirstInteger("Year: 2023")).toBe(2023);
	});

	test("should extract negative integers", () => {
		expect(extractFirstInteger("Temperature: -5 degrees")).toBe(-5);
		expect(extractFirstInteger("Change: -42 points")).toBe(-42);
	});

	test("should handle integers at the beginning of the string", () => {
		expect(extractFirstInteger("123abc")).toBe(123);
		expect(extractFirstInteger("-45test")).toBe(-45);
	});

	test("should handle integers at the end of the string", () => {
		expect(extractFirstInteger("abc123")).toBe(123);
		expect(extractFirstInteger("score: 95")).toBe(95);
	});

	test("should return null when no integer is found", () => {
		expect(extractFirstInteger("No numbers here")).toBeNull();
		expect(extractFirstInteger("Hello world")).toBeNull();
		expect(extractFirstInteger("")).toBeNull();
		expect(extractFirstInteger("abc def ghi")).toBeNull();
	});

	test("should extract the first integer when multiple integers exist", () => {
		expect(extractFirstInteger("10 apples and 20 oranges")).toBe(10);
		expect(extractFirstInteger("Level 5, Score 1000")).toBe(5);
		expect(extractFirstInteger("-10 degrees, 100% humidity")).toBe(-10);
	});

	test("should handle zero correctly", () => {
		expect(extractFirstInteger("Zero: 0")).toBe(0);
		expect(extractFirstInteger("Count: 0 items")).toBe(0);
		expect(extractFirstInteger("-0 is also zero")).toBe(-0);
	});

	test("should ignore decimal numbers and extract only the integer part if it starts a number", () => {
		expect(extractFirstInteger("Price: 25.99 dollars")).toBe(25);
		expect(extractFirstInteger("Price: $25.99")).toBe(25);
		expect(extractFirstInteger("Value: 3.14159")).toBe(3);
		expect(extractFirstInteger("-2.5 degrees")).toBe(-2);
	});

	test("should not extract numbers that are part of words or have no digits", () => {
		expect(extractFirstInteger("abc-def-ghi")).toBeNull();
		expect(extractFirstInteger("no12numbers34here")).toBe(12);
	});

	test("should handle strings with special characters around integers", () => {
		expect(extractFirstInteger("(123) 456-7890")).toBe(123);
		expect(extractFirstInteger("Score: 95%")).toBe(95);
		expect(extractFirstInteger("Level: 5/10")).toBe(5);
		expect(extractFirstInteger("ID: #789")).toBe(789);
	});

	test("should handle large integers", () => {
		expect(extractFirstInteger("Population: 123456789")).toBe(123456789);
		expect(extractFirstInteger("Big number: -987654321")).toBe(-987654321);
	});

	test("should handle edge cases with formatting", () => {
		expect(extractFirstInteger("1,000,000 people")).toBe(1); // Comma-separated - extracts 1
		expect(extractFirstInteger("+42 is positive")).toBe(42);
		expect(extractFirstInteger("--5 is invalid")).toBe(-5);
	});

	test("should handle whitespace and formatting", () => {
		expect(extractFirstInteger("   42   ")).toBe(42);
		expect(extractFirstInteger("\t\t100\n\n")).toBe(100);
	});
});

describe("extractFirstNumber", () => {
	test("should extract positive integers", () => {
		expect(extractFirstNumber("Room 101")).toBe(101);
		expect(extractFirstNumber("The answer is 42")).toBe(42);
		expect(extractFirstNumber("abc123def")).toBe(123);
	});

	test("should extract positive decimal numbers", () => {
		expect(extractFirstNumber("Price: $25.99")).toBe(25.99);
		expect(extractFirstNumber("Temperature: 98.6 degrees")).toBe(98.6);
		expect(extractFirstNumber("Pi is approximately 3.14159")).toBe(3.14159);
	});

	test("should extract negative numbers", () => {
		expect(extractFirstNumber("Temperature: -5 degrees")).toBe(-5);
		expect(extractFirstNumber("Balance: -$100.50")).toBe(100.5);
		expect(extractFirstNumber("The value is -0.75")).toBe(-0.75);
	});

	test("should handle numbers at the beginning of the string", () => {
		expect(extractFirstNumber("123abc")).toBe(123);
		expect(extractFirstNumber("-45.6test")).toBe(-45.6);
	});

	test("should handle numbers at the end of the string", () => {
		expect(extractFirstNumber("abc123")).toBe(123);
		expect(extractFirstNumber("price: 29.99")).toBe(29.99);
	});

	test("should return null when no number is found", () => {
		expect(extractFirstNumber("No numbers here")).toBeNull();
		expect(extractFirstNumber("Hello world")).toBeNull();
		expect(extractFirstNumber("")).toBeNull();
		expect(extractFirstNumber("abc def ghi")).toBeNull();
	});

	test("should extract the first number when multiple numbers exist", () => {
		expect(extractFirstNumber("10 apples and 20 oranges")).toBe(10);
		expect(extractFirstNumber("Price: $25.99, tax: $2.50")).toBe(25.99);
		expect(extractFirstNumber("-5 degrees, 100% humidity")).toBe(-5);
	});

	test("should handle zero correctly", () => {
		expect(extractFirstNumber("Zero: 0")).toBe(0);
		expect(extractFirstNumber("Temperature: 0.0 degrees")).toBe(0);
		expect(extractFirstNumber("Balance: -$0.00")).toBe(0);
	});

	test("should handle scientific notation (if present)", () => {
		expect(extractFirstNumber("Value: 1.5e3")).toBe(1.5); // Only extracts 1.5, not 1500
	});

	test("should handle strings with special characters around numbers", () => {
		expect(extractFirstNumber("(123) 456-7890")).toBe(123);
		expect(extractFirstNumber("Score: 95%")).toBe(95);
		expect(extractFirstNumber("Level: 5/10")).toBe(5);
	});

	test("should handle edge cases with decimals", () => {
		expect(extractFirstNumber(".5 is a number")).toBe(5);
		expect(extractFirstNumber("1.")).toBe(1);
		expect(extractFirstNumber("1.2.3")).toBe(1.2);
	});
});
