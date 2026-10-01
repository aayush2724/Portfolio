/**
 * Settings shared by the two data-sync scripts
 * (.github/scripts/fetch-data.mjs and scripts/update-data.js).
 *
 * LEETCODE_SOLVED_OFFSET is added to the "All" solved count that the LeetCode
 * API reports for the account before the number is written to
 * portfolioData.json — and from there to the hero, the About copy, the stats
 * section, the shell and the bot. The API itself never reports this number.
 *
 * ⚠️  Nothing in this repository substantiates the offset. If it stands for
 * problems solved on another account or platform, keep it and say so in the
 * copy; if it does not, set it to 0 so the site publishes the raw account
 * number. The sync also records the raw figure as `apiSolved` next to
 * `totalSolved` so the two are always visible side by side in the data.
 */
export const LEETCODE_SOLVED_OFFSET = 420
