import { STORAGE_KEYS, loadJSON, saveJSON } from "@/lib/storage";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  describe("STORAGE_KEYS", () => {
    it("exposes the expected storage keys", () => {
      expect(STORAGE_KEYS).toEqual({
        bookmarks: "briefly:v1:bookmarks",
        history: "briefly:v1:history",
        briefs: "briefly:v1:briefs",
        userPreferences: "briefly:v1:userPreferences",
      });
    });
  });

  describe("loadJSON", () => {
    it("returns parsed JSON when valid data exists", () => {
      localStorage.setItem("test:key", JSON.stringify({ a: 1, b: "two" }));

      const result = loadJSON("test:key", { a: 0, b: "" });

      expect(result).toEqual({ a: 1, b: "two" });
    });

    it("returns fallback when key is missing", () => {
      const fallback = { a: 0 };

      const result = loadJSON("missing:key", fallback);

      expect(result).toBe(fallback);
    });

    it("returns fallback when stored JSON is invalid", () => {
      localStorage.setItem("bad:key", "{not valid json");

      const fallback = { safe: true };

      const result = loadJSON("bad:key", fallback);

      expect(result).toBe(fallback);
    });

    it("returns fallback when localStorage.getItem throws", () => {
      const getItemSpy = jest
        .spyOn(Storage.prototype, "getItem")
        .mockImplementation(() => {
          throw new Error("storage unavailable");
        });

      const fallback = { safe: true };

      const result = loadJSON("throwing:key", fallback);

      expect(result).toBe(fallback);
      expect(getItemSpy).toHaveBeenCalledWith("throwing:key");
    });
  });

  describe("saveJSON", () => {
    it("stores JSON-serialized values", () => {
      const value = { a: 1, nested: { b: "two" } };

      saveJSON("save:key", value);

      expect(localStorage.getItem("save:key")).toBe(JSON.stringify(value));
    });

    it("does not throw when localStorage.setItem throws", () => {
      jest
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new Error("quota exceeded");
        });

      expect(() => {
        saveJSON("throwing:key", { a: 1 });
      }).not.toThrow();
    });

    it("stores primitive values as JSON", () => {
      saveJSON("number:key", 123);
      saveJSON("string:key", "hello");
      saveJSON("boolean:key", true);

      expect(localStorage.getItem("number:key")).toBe("123");
      expect(localStorage.getItem("string:key")).toBe('"hello"');
      expect(localStorage.getItem("boolean:key")).toBe("true");
    });
  });
});
