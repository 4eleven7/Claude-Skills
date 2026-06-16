#!/usr/bin/env node
/*
 * Validate bundled skills.
 *
 * Checks:
 * - every plugin skill has SKILL.md frontmatter with name + description
 * - frontmatter name matches the skill directory
 * - descriptions are discovery-oriented and under the runtime prompt limit
 * - each skill has the minimum sections this repository expects
 * - explicit cross-skill references point at an existing skill
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const PLUGINS_DIR = path.join(REPO_ROOT, 'plugins');
const MAX_DESCRIPTION_LENGTH = 1024;

const REQUIRED_SECTION_GROUPS = [
  {
    label: 'title',
    patterns: [/^#\s+\S/m],
  },
  {
    label: 'at least one second-level section',
    patterns: [/^##\s+\S/m],
  },
];

const SKILL_REF_PATTERNS = [
  /\buse the `([a-z][a-z0-9-]*-[a-z0-9-]+)` skill/g,
  /\bfollow the `([a-z][a-z0-9-]*-[a-z0-9-]+)` skill/g,
  /\binvoke the `([a-z][a-z0-9-]*-[a-z0-9-]+)` skill/g,
  /\bcontinue with `([a-z][a-z0-9-]*-[a-z0-9-]+)`/g,
  /\buse `([a-z][a-z0-9-]*-[a-z0-9-]+)` skill/g,
  /`([a-z][a-z0-9-]*-[a-z0-9-]+)` skill\b/g,
  /`([a-z][a-z0-9-]*-[a-z0-9-]+)` persona\b/g,
  /\bsee `([a-z][a-z0-9-]*-[a-z0-9-]+)`/g,
];

function parseFrontmatter(content) {
  const match = content.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n/);
  if (!match) return null;

  const result = {};
  for (const line of match[1].split(/\r?\n/)) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key) result[key] = value;
  }
  return result;
}

function listSkillFiles() {
  if (!fs.existsSync(PLUGINS_DIR)) {
    throw new Error(`plugins directory not found at ${PLUGINS_DIR}`);
  }

  const files = [];
  for (const plugin of fs.readdirSync(PLUGINS_DIR)) {
    const skillsDir = path.join(PLUGINS_DIR, plugin, 'skills');
    if (!fs.existsSync(skillsDir)) continue;
    for (const skill of fs.readdirSync(skillsDir)) {
      const skillDir = path.join(skillsDir, skill);
      if (!fs.statSync(skillDir).isDirectory()) continue;
      files.push(path.join(skillDir, 'SKILL.md'));
    }
  }
  return files.sort();
}

function stripCodeFences(content) {
  return content.replace(/```[\s\S]*?```/g, '');
}

function extractSkillReferences(content) {
  const refs = new Set();
  const searchable = stripCodeFences(content);
  for (const pattern of SKILL_REF_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(searchable)) !== null) {
      refs.add(match[1]);
    }
  }
  return refs;
}

function validateSkill(filePath, knownSkills) {
  const errors = [];
  const warnings = [];
  const rel = path.relative(REPO_ROOT, filePath);
  const dirName = path.basename(path.dirname(filePath));

  if (!fs.existsSync(filePath)) {
    errors.push('Missing SKILL.md');
    return { rel, errors, warnings };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const frontmatter = parseFrontmatter(content);

  if (!frontmatter) {
    errors.push('Missing or malformed YAML frontmatter');
  } else {
    if (!frontmatter.name) {
      errors.push("Frontmatter missing required field: 'name'");
    } else if (frontmatter.name !== dirName) {
      errors.push(`Frontmatter name '${frontmatter.name}' does not match directory '${dirName}'`);
    }

    if (!frontmatter.description) {
      errors.push("Frontmatter missing required field: 'description'");
    } else {
      if (frontmatter.description.length > MAX_DESCRIPTION_LENGTH) {
        errors.push(`Description is ${frontmatter.description.length} chars; max is ${MAX_DESCRIPTION_LENGTH}`);
      }
      if (!/\bUse when\b/i.test(frontmatter.description)) {
        errors.push('Description must include "Use when" trigger wording');
      }
    }
  }

  for (const group of REQUIRED_SECTION_GROUPS) {
    if (!group.patterns.some((pattern) => pattern.test(content))) {
      errors.push(`Missing required section group: ${group.label}`);
    }
  }

  for (const ref of extractSkillReferences(content)) {
    if (!knownSkills.has(ref)) {
      warnings.push(`Dead cross-skill reference: \`${ref}\``);
    }
  }

  return { rel, errors, warnings };
}

function main() {
  const files = listSkillFiles();
  const knownSkills = new Set(files.map((filePath) => path.basename(path.dirname(filePath))));

  let errorCount = 0;
  let warningCount = 0;

  for (const filePath of files) {
    const result = validateSkill(filePath, knownSkills);
    errorCount += result.errors.length;
    warningCount += result.warnings.length;

    if (result.errors.length === 0 && result.warnings.length === 0) {
      console.log(`  ok   ${result.rel}`);
      continue;
    }

    console.log(`${result.errors.length ? '  fail' : '  warn'} ${result.rel}`);
    for (const error of result.errors) console.log(`       ERROR: ${error}`);
    for (const warning of result.warnings) console.log(`       WARN:  ${warning}`);
  }

  const status = errorCount ? 'FAILED' : warningCount ? 'PASSED WITH WARNINGS' : 'PASSED';
  console.log(`\n${files.length} skills checked; ${errorCount} error(s), ${warningCount} warning(s); ${status}`);

  if (errorCount) process.exit(1);
}

try {
  main();
} catch (error) {
  console.error(`ERROR: validate-skills failed: ${error.message}`);
  process.exit(1);
}
