/**
 * Automated walkthrough test for "The Lockdown" storyline.
 *
 * Verifies all files are accessible, all endings are reachable, and no
 * content is locked behind unobtainable keys.
 */

import { describe, expect, test } from "vitest";
import { type WalkReport, walkStoryline } from "../__tests__/storyline-walker";
import lockdownStoryline from "./lockdown";

describe("The Lockdown", () => {
    let report: WalkReport;

    test("walks without errors", () => {
        report = walkStoryline(lockdownStoryline);
        expect(report.errors).toEqual([]);
    });

    test("no missed files", () => {
        // Files created dynamically during play (not in the fresh tree)
        const dynamicFiles = new Set(["/lockout.txt", "/sys/safe/user_report.txt", "/gnu.webm"]);

        // Intentionally missable: only 2 diary_entry keys for 3 locked entries.
        // may5.txt has no narrative callback — the walker prioritises may1 + may8.
        const intentionallyOptional = new Set(["/users/evan/diary/may5.txt"]);

        const realMisses = report.missedFilePaths.filter((p) => !dynamicFiles.has(p) && !intentionallyOptional.has(p));
        expect(realMisses).toEqual([]);
    });

    test("all endings reached", () => {
        expect(report.endingsReached.sort()).toEqual([
            "ending_destroy.txt",
            "ending_expose.txt",
            "ending_wait.txt",
            "resolve.txt",
        ]);
    });

    test("all choice branches explored", () => {
        expect(report.choicePathsExplored).toBe(3);
    });
});
