import { describe, expect, it } from "vitest";
import { buildEditorFormConfig, editorEntityIds } from "../src/editor-form";

describe("editor form", () => {
  it("uses a multi-entity selector instead of disabling the visual editor", () => {
    const form = buildEditorFormConfig();
    const entitiesField = form.schema.find((field) => field.name === "entities");

    expect(entitiesField).toMatchObject({
      name: "entities",
      required: true,
      selector: {
        entity: {
          domain: "sensor",
          multiple: true,
          reorder: true,
        },
      },
    });
    expect("assertConfig" in form).toBe(false);
  });

  it("maps string and object entity config to editor ids", () => {
    expect(
      editorEntityIds({
        entities: [
          "sensor.one",
          { entity: "sensor.two", name: "Two" },
        ],
      }),
    ).toEqual(["sensor.one", "sensor.two"]);

    expect(editorEntityIds({ entity: "sensor.single" })).toEqual(["sensor.single"]);
  });

  it("exposes rolling versus fixed day range alignment", () => {
    const form = buildEditorFormConfig();
    const rangeField = form.schema.find((field) => field.name === "range");
    const rangeSchema = rangeField?.schema as Array<Record<string, unknown>>;
    const alignField = rangeSchema.find((field) => field.name === "align");

    expect(alignField).toMatchObject({
      name: "align",
      selector: {
        select: {
          options: [
            { value: "day", label: "Fixed days, 00:00-23:59" },
            { value: "rolling", label: "Rolling window" },
          ],
        },
      },
    });
  });
});
