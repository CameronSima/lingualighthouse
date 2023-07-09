import { cleanVideoId, validateEmail } from "./utils";

test("validateEmail returns false for non-emails", () => {
  expect(validateEmail(undefined)).toBe(false);
  expect(validateEmail(null)).toBe(false);
  expect(validateEmail("")).toBe(false);
  expect(validateEmail("not-an-email")).toBe(false);
  expect(validateEmail("n@")).toBe(false);
});

test("validateEmail returns true for emails", () => {
  expect(validateEmail("kody@example.com")).toBe(true);
});

test("cleanVideoId", () => {
  expect(cleanVideoId("https://www.youtube.com/watch?v=1234")).toBe("1234");
  expect(cleanVideoId("https://youtu.be/1234")).toBe("1234");
  expect(cleanVideoId("https://www.youtube.com/embed/1234")).toBe("1234");
  expect(cleanVideoId("https://m.youtube.com/watch?v=1234")).toBe("1234");
  expect(
    cleanVideoId("https://www.youtube.com/watch?v=1234&feature=sharea")
  ).toBe("1234");
  expect(cleanVideoId("youtube.com/watch?v=1234?feature=sharea")).toBe("1234");
});
