/**
 * Automated walkthrough test for "The Things We Don't Say" storyline.
 */

import { describe, expect, test } from "vitest";
import { type WalkReport, walkStoryline } from "../__tests__/storyline-walker";
import unsaidStoryline from "./unsaid";

describe("The Things We Don't Say", () => {
    let report: WalkReport;

    test("walks without errors", () => {
        report = walkStoryline(unsaidStoryline);
        expect(report.errors).toEqual([]);
    });

    test("no missed files", () => {
        const dynamicFiles = new Set<string>([
            // No dynamically-created files in this storyline
        ]);

        const realMisses = report.missedFilePaths.filter((p) => !dynamicFiles.has(p));
        expect(realMisses).toEqual([]);
    });

    test("all endings reached", () => {
        expect(report.endingsReached.sort()).toEqual([
            "ending_conversation.txt",
            "ending_understanding.txt",
            "resolve.txt",
        ]);
    });

    test("both choice branches explored", () => {
        expect(report.choicePathsExplored).toBe(2);
    });
});
