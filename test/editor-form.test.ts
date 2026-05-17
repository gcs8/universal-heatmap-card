import { describe, expect, it } from "vitest";
import {
  buildEditorFormConfig,
  editorEntityIds,
  mergeEditorEntities,
  updateEditorEntityName,
} from "../src/editor-form";

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

  it("labels scale fields and explains auto-range controls", () => {
    const form = buildEditorFormConfig();

    expect(form.computeLabel({ name: "preset" })).toBe("Scale preset");
    expect(form.computeLabel({ name: "min" })).toBe("Minimum value");
    expect(form.computeLabel({ name: "max" })).toBe("Maximum value");
    expect(form.computeLabel({ name: "unit" })).toBe("Display unit");
    expect(form.computeLabel({ name: "sensitivity" })).toBe("Scale tuning");
    expect(form.computeLabel({ name: "outlier_clip" })).toBe("Outlier clip");
    expect(form.computeHelper({ name: "min" })).toContain("auto-range");
    expect(form.computeHelper({ name: "sensitivity" })).toContain("exaggerate");
  });

  it("preserves object entity options when the visual editor changes selected ids", () => {
    expect(
      mergeEditorEntities(
        {
          entities: [
            "sensor.one",
            { entity: "sensor.two", name: "Two", scale: { preset: "temperature" } },
          ],
        },
        ["sensor.two", "sensor.three"],
      ),
    ).toEqual([
      { entity: "sensor.two", name: "Two", scale: { preset: "temperature" } },
      "sensor.three",
    ]);
  });

  it("updates visual-editor entity aliases without dropping per-entity options", () => {
    const config = updateEditorEntityName(
      {
        entity: "sensor.legacy",
        entities: [
          "sensor.one",
          { entity: "sensor.two", name: "Two", scale: { preset: "humidity" } },
        ],
      },
      "sensor.two",
      "Bedroom",
    );

    expect(config.entity).toBeUndefined();
    expect(config.entities).toEqual([
      "sensor.one",
      { entity: "sensor.two", name: "Bedroom", scale: { preset: "humidity" } },
    ]);
  });

  it("clears visual-editor entity aliases back to Home Assistant names", () => {
    const config = updateEditorEntityName(
      { entities: [{ entity: "sensor.one", name: "One" }] },
      "sensor.one",
      " ",
    );

    expect(config.entities).toEqual(["sensor.one"]);
  });
});
