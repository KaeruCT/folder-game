/**
 * Automated walkthrough test for "The Echoes Below" storyline.
 *
 * Verifies all files are accessible, all endings are reachable, and no
 * content is locked behind unobtainable keys.
 */

import { describe, expect, test } from "vitest";
import { type WalkReport, walkStoryline } from "../__tests__/storyline-walker";
import echoesStoryline from "./echoes";

describe("The Echoes Below", () => {
    let report: WalkReport;

    test("walks without errors", () => {
        report = walkStoryline(echoesStoryline);
        expect(report.errors).toEqual([]);
    });

    test("no missed files", () => {
        // Files created dynamically during play (not in the fresh tree)
        const dynamicFiles = new Set(["/research/texts/decrypted/decoded_output.txt", "/decide.txt"]);

        const realMisses = report.missedFilePaths.filter((p) => !dynamicFiles.has(p));
        expect(realMisses).toEqual([]);
    });

    test("all endings reached", () => {
        expect(report.endingsReached.sort()).toEqual(["decide.txt", "ending_chiara.txt", "ending_silence.txt"]);
    });

    test("both choice branches explored", () => {
        expect(report.choicePathsExplored).toBe(2);
    });
});
