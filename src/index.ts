import {LeetCode, Credential, RateLimiter} from "leetcode-query";
import simpleGit from "simple-git";
import * as fs from "fs";

const directoryPrefix = `${process.cwd()}/leetcode`;

// Initialize Git client
const git = simpleGit({
  baseDir: directoryPrefix
});

// Find last commit
let lastCommitDate = new Date(0);
try {
  const {latest} = await git.log();
  lastCommitDate = new Date(latest?.date!);
} catch (err) {
}

// Initialize LeetCode client
const credential = new Credential();
await credential.init(process.env.LEETCODE_COOKIE);
const leetcode = new LeetCode(credential);
leetcode.limiter = new RateLimiter({limit: 20, concurrent: 1});

// Extract new submissions
let submissions = [];
const LIMIT = 20;
let offset = 0;
do {
  const data = await leetcode.submissions({limit: LIMIT, offset});
  if (data.length == 0) {
    break;
  }
  submissions.push(...data.filter(submission => submission.statusDisplay === "Accepted"));
  offset += LIMIT;
} while (submissions[submissions.length - 1].timestamp > lastCommitDate.getTime())
submissions = submissions.filter(submission => submission.timestamp > lastCommitDate.getTime()).reverse();

// Commit
let hasCommit = false;
for (const {id, title, titleSlug, lang, timestamp} of submissions) {
  try {
    const {code} = await leetcode.submission(id);
    const directoryName = `${directoryPrefix}/${titleSlug}`;
    if (!fs.existsSync(directoryName)) {
      fs.mkdirSync(directoryName);
    }
    const fileName = `${directoryPrefix}/${titleSlug}/${lang}`;
    if (fs.existsSync(fileName)) {
      fs.rmSync(fileName);
    }
    fs.writeFileSync(fileName, code);
    await git.add(`${titleSlug}/${lang}`);
    const date = new Date(timestamp);
    await git.commit(`Submit ${title}`, undefined, {
      "--author": `${process.env.AUTHOR} <${process.env.AUTHOR_EMAIL}>`,
      "--date": `${date.getTime() / 1000} ${date.toString().substring(28, 33)}`
    });
    hasCommit = true;
  } catch (err) {
    console.error(`Failed to extract submission. Submission ID: ${id} Title: ${title} Timestamp: ${timestamp}`);
    console.error(err);
    break;
  }
}

// Push
if (hasCommit) {
  await git.push();
}