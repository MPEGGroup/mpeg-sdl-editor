import { describe, expect, test } from "bun:test";
import { createParser } from "../src/sdl/sdlLanguage";

describe("sdlLanguage", () => {
  test("parses valid SDL without error", () => {
    const parser = createParser();
    const input = "computed const int a = 1;";
    const tree = parser.parse(input);

    // The root node should not be an error
    expect(tree.type.isError).toBe(false);

    // There should be no error nodes in the tree
    let hasError = false;
    tree.iterate({
      enter: (type) => {
        if (type.type.isError) hasError = true;
      },
    });

    expect(hasError).toBe(false);
  });

  test("parses invalid SDL with error node", () => {
    const parser = createParser();
    const input = "invalid sdl $";
    const tree = parser.parse(input);

    // The tree should contain an error node
    let hasError = false;
    tree.iterate({
      enter: (type) => {
        if (type.type.isError) hasError = true;
      },
    });

    expect(hasError).toBe(true);
  });
});
