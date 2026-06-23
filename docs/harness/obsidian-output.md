# Obsidian Copy Policy

設計書、ユースケース、タスク、レビュー、意思決定の正本はプロジェクト内の `docs/` に保存する。

Obsidian vault は検索、閲覧、知識蓄積のためのコピー先として扱う。

## Product Folder

プロダクトごとに Obsidian vault 内にフォルダを作成し、プロジェクトの `docs/` 構造をコピーする。

```text
<Obsidian Vault>/
└── <ProductName>/
    └── docs/
        ├── sekkeisyo/
        ├── usecase/
        ├── ui/
        ├── bugs/
        ├── tasks/
        ├── reviews/
        ├── implementation/
        └── decisions/
```

## Source

コピー元と命名規則は `docs/harness/document-storage.md` に従う。

## Task File Format

```md
# Task1: <task title>

## Goal

## Scope

## Owned Files

## Read-only Context

## Out of Scope

## Implementation Steps

## Acceptance Criteria

## Verification

## Dependencies

## Parallel Safety

## Agent Assignment
```

## Rules

- コピーはプロジェクトの `docs/` から Obsidian への一方向を基本とする。
- Obsidian 側の編集を無条件で正本へ上書きしない。
- API key や secrets をドキュメントへ含めない。
- コピー失敗で開発 workflow を止めない。正本はプロジェクト内に残る。
