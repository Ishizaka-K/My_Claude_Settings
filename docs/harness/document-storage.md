# Document Storage Policy

設計、ユースケース、タスク、レビュー、意思決定の正本は、プロジェクト内の `docs/` に保存する。

Obsidian は正本ではなく、検索、閲覧、知識蓄積のためのコピー先として扱う。

## Run ID

関連ドキュメントを追跡できるように、同じ作業では共通の `<run-id>` を使う。

```text
YYYYMMDD-HHmm-<topic>
```

例:

```text
20260620-1430-user-auth
```

`<topic>` は短い kebab-case にする。日時だけの命名は内容を判別しにくいため避ける。

## Canonical Structure

```text
docs/
├── sekkeisyo/
│   └── sekkeisyo-<run-id>.md
├── usecase/
│   └── usecase-<run-id>.md
├── ui/
│   └── ui-<run-id>.md
├── bugs/
│   └── bug-YYYYMMDD-HHmm-<bug-summary>.md
├── tasks/
│   └── <run-id>/
│       ├── Task1.md
│       ├── Task2.md
│       └── Task3.md
├── reviews/
│   └── <run-id>/
│       ├── design-review.md
│       ├── task-review.md
│       ├── implementation-review-Task1.md
│       └── integration-review.md
├── implementation/
│   └── <run-id>/
│       ├── Task1.md
│       └── Task2.md
└── decisions/
    └── decisions-<run-id>.md
```

## Naming Rules

- 設計書: `docs/sekkeisyo/sekkeisyo-<run-id>.md`
- ユースケース: `docs/usecase/usecase-<run-id>.md`
- UI設計書: `docs/ui/ui-<run-id>.md`
- バグ調査・修正記録: `docs/bugs/bug-YYYYMMDD-HHmm-<bug-summary>.md`
- タスク: `docs/tasks/<run-id>/Task1.md` から連番
- 設計レビュー: `docs/reviews/<run-id>/design-review.md`
- タスクレビュー: `docs/reviews/<run-id>/task-review.md`
- 実装レビュー: `docs/reviews/<run-id>/implementation-review-TaskN.md`
- 統合レビュー: `docs/reviews/<run-id>/integration-review.md`
- 実装ログ: `docs/implementation/<run-id>/TaskN.md`
- 意思決定: `docs/decisions/decisions-<run-id>.md`

## Accumulation

- 過去の設計書を上書きしない。
- 同じテーマを再設計する場合も、新しい日時の `<run-id>` で新規作成する。
- 後続資料には設計書への相対リンクを入れる。
- superseded になった資料は削除せず、先頭に後継資料へのリンクを入れる。

## Obsidian Copy

作業の節目で、プロジェクトの `docs/` を Obsidian vault の `<ProductName>/docs/` にコピーする。

```text
<Obsidian Vault>/
└── <ProductName>/
    └── docs/
        ├── sekkeisyo/
        ├── usecase/
        ├── tasks/
        ├── reviews/
        ├── implementation/
        └── decisions/
```

Obsidian 側で内容を編集した場合は自動で正本へ戻さない。プロジェクト側への反映は、差分を確認して明示的に行う。
