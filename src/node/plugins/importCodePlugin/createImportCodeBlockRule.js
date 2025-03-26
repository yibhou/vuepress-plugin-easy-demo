import { path } from "vuepress/utils";

// min length of the import code syntax, i.e. '@[demo]()'
const MIN_LENGTH = 9;

// char codes of '@[demo'
const START_CODES = [64, 91, 100, 101, 109, 111];

// regexp to match the import syntax
const SYNTAX_RE =
  /^@\[demo(?:{(?:(?:(?<lineStart>\d+)?-(?<lineEnd>\d+)?)|(?<lineSingle>\d+))})?(?: (?<info>[^\]]+))?\]\((?<importPath>[^)]*)\)/;

/**
 * Utility function to parse line number from line string that matched by SYNTAX_RE
 */
const parseLineNumber = (line) => (line ? Number.parseInt(line, 10) : undefined);

export const createImportCodeBlockRule =
  ({ handleImportPath = (str) => str }) =>
  (state, startLine, endLine, silent) => {
    // if it's indented more than 3 spaces, it should be a code block
    /* istanbul ignore if */
    if (state.sCount[startLine] - state.blkIndent >= 4) {
      return false;
    }

    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];

    // return false if the length is shorter than min length
    if (pos + MIN_LENGTH > max) return false;

    // check if it's matched the start
    for (let i = 0; i < START_CODES.length; i += 1) {
      if (state.src.charCodeAt(pos + i) !== START_CODES[i]) {
        return false;
      }
    }

    // check if it's matched the syntax
    const match = state.src.slice(pos, max).match(SYNTAX_RE);
    if (!match?.groups) return false;

    // return true as we have matched the syntax
    if (silent) return true;

    const { info, importPath } = match.groups;

    const lineSingle = parseLineNumber(match.groups.lineSingle);
    const lineStart = lineSingle ?? parseLineNumber(match.groups.lineStart) ?? 0;
    const lineEnd = lineSingle ?? parseLineNumber(match.groups.lineEnd);

    const meta = {
      importPath: handleImportPath(importPath),
      lineStart,
      lineEnd,
    };

    // create a import_demo token
    const token = state.push("import_demo", "code", 0);

    // use user specified info, or fallback to file ext
    token.info = info ?? path.extname(meta.importPath).slice(1);
    token.markup = "```";
    token.map = [startLine, startLine + 1];
    // store token meta to be used in renderer rule
    token.meta = meta;

    state.line = startLine + 1;

    return true;
  };
