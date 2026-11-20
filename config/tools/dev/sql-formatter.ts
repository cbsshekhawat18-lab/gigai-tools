import type { Tool } from "@/types";

/**
 * SQL Formatter: a dialect-aware SQL beautifier and minifier that runs fully
 * in the browser. It reindents and case-normalises queries across twelve+
 * engines (PostgreSQL, MySQL, MariaDB, SQLite, SQL Server / T-SQL, BigQuery,
 * Snowflake and more), collapses a query to a compact single line, and never
 * sends a byte to a server. Copy is unique to SQL formatting and written to
 * rank for the exact queries developers type when a migration or dbt model is
 * an unreadable one-line wall of text.
 */
const sqlFormatter: Tool = {
  slug: "sql-formatter",
  title: "SQL Formatter",
  description:
    "Format, beautify and minify SQL in your browser with a dialect picker (PostgreSQL, MySQL, T-SQL, BigQuery, Snowflake…), keyword-case control and custom indentation: nothing is uploaded.",
  category: "developer-tools",
  icon: "Database",
  accent: "cyan",
  status: "live",
  createdAt: "2026-06-24",

  h1: "SQL Formatter & Beautifier, Online, Dialect-Aware",
  tagline:
    "Paste an unreadable query and get clean, consistently indented SQL in an instant. Pick your exact dialect, choose upper/lower/preserve keyword case, set your indent, or minify to one line, all client-side, nothing uploaded.",
  longDescription:
    "The GigAI SQL Formatter is a desktop-grade SQL beautifier that runs entirely in your browser. Paste, drop or type a query and it reindents joins, subqueries, CTEs and CASE expressions into a clean, reviewable shape, aligns clauses, and normalises keyword casing: all in real time as you type. Unlike generic 'pretty print' boxes, it is dialect-aware: choose Standard SQL, PostgreSQL, MySQL, MariaDB, SQLite, SQL Server (T-SQL), BigQuery or Snowflake so identifier quoting, string syntax and engine-specific keywords are formatted the way that engine actually parses them. Flip keyword case to UPPER, lower or preserve to match your team's style guide, set 2-space, 4-space or tab indentation, and toggle Minify to collapse a formatted statement back to a single compact line for logging, embedding in code, or a copy-paste into a shell. It shows character and line counts before and after so you can see what changed at a glance, keeps a full undo/redo history, and works from the keyboard with real shortcuts. Because formatting happens locally, your schema names, table structures, WHERE clauses and any literal values in your queries are never uploaded, logged or seen by anyone: safe for production migrations, proprietary schemas and PII-bearing statements. Close the tab and it's gone.",

  ctaText: "Format SQL",

  keywords: [
    "sql formatter",
    "sql beautifier",
    "format sql online",
    "sql pretty print",
    "sql minifier",
    "postgresql formatter",
    "mysql formatter",
    "t-sql formatter",
    "bigquery sql formatter",
    "snowflake sql formatter",
    "beautify sql query",
    "online sql beautifier",
  ],

  seo: {
    title: "SQL Formatter & Beautifier: Format SQL Online (Postgres, MySQL, T-SQL) | GigAI Tools",
    description:
      "Free online SQL formatter and beautifier with a dialect picker for PostgreSQL, MySQL, MariaDB, SQLite, T-SQL, BigQuery and Snowflake. Beautify or minify SQL, control keyword case and indentation: 100% in your browser, no uploads.",
  },

  features: [
    {
      icon: "Database",
      title: "Dialect-aware formatting",
      description:
        "Format for Standard SQL, PostgreSQL, MySQL, MariaDB, SQLite, SQL Server (T-SQL), BigQuery or Snowflake so engine-specific keywords, quoting and syntax are laid out the way that database actually parses them.",
    },
    {
      icon: "CaseUpper",
      title: "Keyword case control",
      description:
        "Force reserved words to UPPERCASE, lowercase, or preserve them exactly as written: match your team's style guide or linter with a single toggle.",
    },
    {
      icon: "IndentIncrease",
      title: "Custom indentation",
      description:
        "Beautify with 2-space, 4-space or tab indentation. Joins, subqueries, CTEs and CASE expressions are nested consistently so long queries stay readable.",
    },
    {
      icon: "Minimize2",
      title: "Beautify or minify",
      description:
        "Pretty-print a wall-of-text query, or collapse a formatted statement back to a single compact line for logging, embedding in source code, or pasting into a shell.",
    },
    {
      icon: "Zap",
      title: "Live as you type",
      description:
        "Formatting runs on every keystroke with a smart debounce, so the output and the before/after size stats stay in sync without hunting for a 'Format' button.",
    },
    {
      icon: "ShieldCheck",
      title: "100% in your browser",
      description:
        "Your query is formatted on your device. No schema name, table, WHERE clause or literal value is ever uploaded, stored or logged.",
    },
  ],

  benefits: [
    {
      title: "Make review-ready migrations",
      description:
        "Turn a machine-generated, single-line migration or dbt model into a cleanly indented statement your reviewers can actually read, with consistent casing for tidy Git diffs.",
    },
    {
      title: "Match your engine exactly",
      description:
        "Formatting for the right dialect avoids mangling engine-specific syntax: backtick identifiers in MySQL, bracketed ones in T-SQL, or Snowflake and BigQuery functions all stay intact.",
    },
    {
      title: "Compact for logs and code",
      description:
        "Minify a formatted query back to one line when you need to embed it in a string literal, a config file, or a log line without wrapping.",
    },
    {
      title: "Private by design",
      description:
        "Because it runs locally, you can format queries containing proprietary schemas, internal table names or literal PII, none of it leaves your machine.",
    },
  ],

  howTo: [
    {
      title: "Paste, drop or import SQL",
      description:
        "Paste into the left editor, drag a .sql file onto it, or click to browse. Or load a built-in sample to try it instantly.",
    },
    {
      title: "Pick your dialect",
      description:
        "Choose the database you're targeting (PostgreSQL, MySQL, T-SQL, BigQuery, Snowflake and more) so the output matches how that engine parses SQL.",
    },
    {
      title: "Set case, indent & mode",
      description:
        "Choose UPPER, lower or preserve keyword case, set 2-space, 4-space or tab indentation, and switch between Beautify and Minify. Everything re-runs live.",
    },
    {
      title: "Copy, download or share",
      description:
        "Copy the formatted SQL, download it as a .sql file, or share a link that reopens the tool with your query pre-loaded.",
    },
  ],

  formats: {
    input: ["SQL", "TXT"],
    output: ["SQL"],
  },

  useCases: [
    {
      audience: "Backend developer",
      title: "Clean up a generated migration",
      description:
        "Paste a one-line migration or an ORM-generated statement, format it for your dialect, and commit a readable version so reviewers can reason about the schema change.",
    },
    {
      audience: "Data / analytics engineer",
      title: "Standardise dbt models & warehouse SQL",
      description:
        "Format BigQuery or Snowflake models to a house style with consistent keyword case and indentation, keeping large analytical queries with many CTEs maintainable.",
    },
    {
      audience: "DBA",
      title: "Read a query pulled from logs",
      description:
        "Drop a slow query captured from a log or the network tab, beautify it, and follow the joins and WHERE conditions to find what to index.",
    },
    {
      audience: "Student",
      title: "Learn query structure",
      description:
        "Beautify a compact example to see how SELECT, FROM, JOIN, WHERE and GROUP BY nest together, with instant, engine-correct formatting as you edit.",
    },
  ],

  troubleshooting: [
    {
      problem: "My query didn't change or looks wrong after formatting.",
      solution:
        "Make sure the dialect matches your database. A T-SQL query with bracketed identifiers or a MySQL query with backticks can format oddly under Standard SQL. Switch the dialect picker to your actual engine and re-run.",
    },
    {
      problem: "It threw an error on my SQL.",
      solution:
        "The formatter tokenises SQL and can reject genuinely malformed input, an unterminated string, an unbalanced parenthesis, or a stray delimiter. Read the message, fix the flagged construct, and it will format. It formats syntax. It does not execute or validate against a live schema.",
    },
    {
      problem: "Keyword case didn't apply to my column names.",
      solution:
        "Keyword-case control only touches reserved words (SELECT, FROM, JOIN…), never your identifiers. Table and column names are always preserved exactly so your query keeps working on case-sensitive engines.",
    },
    {
      problem: "Minify put everything on one line but I wanted it compact and readable.",
      solution:
        "Minify is intentionally a single line for logging and embedding. For a compact-but-readable result, use Beautify with 2-space indentation instead.",
    },
  ],

  tips: [
    "Set the dialect first. It changes how identifiers and engine-specific keywords are formatted more than any other option.",
    "Use UPPER keyword case for a classic, scannable look, or preserve to keep exactly what you typed for lower-case house styles.",
    "Press Ctrl/Cmd+Enter to re-run instantly, and Ctrl/Cmd+S to download the formatted query as a .sql file.",
    "Toggle Minify to collapse a formatted statement into a one-liner you can paste straight into a string literal or a psql/mysql shell.",
    "Formatting big multi-CTE queries? 4-space indentation makes deeply nested subqueries easier to follow.",
  ],

  security:
    "Your SQL is tokenised and formatted entirely in your browser. It is never uploaded to any server. Nothing is stored, logged or transmitted, so you can safely format queries containing proprietary schema names, internal tables or literal personal data. Close the tab and every trace is gone.",

  faq: [
    {
      question: "Is my SQL uploaded to a server?",
      answer:
        "No. All parsing and formatting happen locally in your browser. Your query never leaves your device, so there is nothing for us to store, log or see. It is safe to format SQL containing proprietary schemas, internal table names or personal data.",
    },
    {
      question: "Which SQL dialects are supported?",
      answer:
        "You can format for Standard SQL, PostgreSQL, MySQL, MariaDB, SQLite, SQL Server (T-SQL), BigQuery and Snowflake. Picking the right dialect means engine-specific keywords, identifier quoting (backticks, brackets, double quotes) and syntax are laid out the way that database actually parses them.",
    },
    {
      question: "What's the difference between Beautify and Minify?",
      answer:
        "Beautify pretty-prints your query with line breaks and indentation so joins, subqueries and CTEs are readable. Pick 2-space, 4-space or tab indent. Minify collapses a statement to a single compact line, ideal for log lines, embedding in a string literal, or pasting into a shell.",
    },
    {
      question: "Does the formatter change my table or column names?",
      answer:
        "No. Keyword-case control only affects reserved words like SELECT, FROM and JOIN. Your identifiers (table names, column names, aliases and string literals) are always preserved exactly, so your query keeps working on case-sensitive databases.",
    },
    {
      question: "Can I control the keyword case?",
      answer:
        "Yes. Choose UPPERCASE for the classic scannable style, lowercase to match a lower-case house style, or preserve to leave every keyword exactly as you typed it. This applies only to reserved words, never to your identifiers.",
    },
    {
      question: "Does it run or validate my query against a database?",
      answer:
        "No. It is a pure formatter: it tokenises and reindents your SQL without connecting to any database. It can flag genuinely malformed syntax (like an unterminated string), but it never executes your query or checks it against a live schema, so it's completely safe to use on production statements.",
    },
    {
      question: "Why does my query look wrong after formatting?",
      answer:
        "Almost always the dialect is mismatched. A MySQL query with backtick identifiers or a T-SQL query with bracketed ones can format oddly under Standard SQL. Switch the dialect picker to your actual engine and re-run. The layout will match how that database reads it.",
    },
    {
      question: "Is there a size limit?",
      answer:
        "There is a generous character guard so the browser tab stays responsive on very large scripts. Most migrations, models and captured queries are well within it. For extremely large multi-statement files, format them in sections.",
    },
  ],

  changelog: [
    {
      date: "2026-06-24",
      change:
        "Initial release, live dialect-aware beautify/minify for eight engines, keyword-case control, 2/4/tab indentation, before/after size stats, drag-drop import, undo/redo and shareable links.",
    },
    {
      date: "2026-06-28",
      change:
        "Added keyboard shortcuts (run, download, clear, undo/redo) with an in-tool helper, plus a curated set of sample queries covering joins, CTEs and window functions.",
    },
    {
      date: "2026-07-02",
      change:
        "Refined Minify to preserve string literals and comments correctly, and improved error messages for unterminated strings and unbalanced parentheses.",
    },
  ],

  relatedTools: ["json-formatter", "jwt-decoder", "base64-encoder", "uuid-generator"],
};

export default sqlFormatter;
