/**
 * Automated walkthrough test for "The Agent in the Machine" storyline.
 *
 * Verifies all files are accessible, all endings are reachable, and no
 * content is locked behind unobtainable keys.
 */

import { describe, expect, test } from "vitest";
import { type WalkReport, walkStoryline } from "../__tests__/storyline-walker";
import agentStoryline from "./agent";

describe("The Agent in the Machine", () => {
    let report: WalkReport;

    test("walks without errors", () => {
        report = walkStoryline(agentStoryline);
        expect(report.errors).toEqual([]);
    });

    test("no missed files", () => {
        const dynamicFiles = new Set(["/diagnostics/evidence_packet.txt", "/resolve.txt"]);

        const realMisses = report.missedFilePaths.filter((p) => !dynamicFiles.has(p));
        expect(realMisses).toEqual([]);
    });

    test("all endings reached", () => {
        expect(report.endingsReached.sort()).toEqual(["ending_rollback.txt", "ending_stay.txt", "resolve.txt"]);
    });

    test("both choice branches explored", () => {
        expect(report.choicePathsExplored).toBe(2);
    });
});
