/**
 * Automated walkthrough test for "What We Owe Each Other" storyline.
 */

import { describe, expect, test } from "vitest";
import { type WalkReport, walkStoryline } from "../__tests__/storyline-walker";
import restaurantStoryline from "./restaurant";

describe("What We Owe Each Other", () => {
    let report: WalkReport;

    test("walks without errors", () => {
        report = walkStoryline(restaurantStoryline);
        expect(report.errors).toEqual([]);
    });

    test("no missed files", () => {
        const dynamicFiles = new Set<string>([]);
        const realMisses = report.missedFilePaths.filter((p) => !dynamicFiles.has(p));
        expect(realMisses).toEqual([]);
    });

    test("all endings reached", () => {
        expect(report.endingsReached.sort()).toEqual(["ending_keep.txt", "ending_letgo.txt", "resolve.txt"]);
    });

    test("both choice branches explored", () => {
        expect(report.choicePathsExplored).toBe(2);
    });
});
