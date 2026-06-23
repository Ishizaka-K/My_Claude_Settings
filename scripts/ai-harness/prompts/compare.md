# Goal

Claude の案と Codex の案、または複数の設計案を比較し、採用判断を助けてください。

# Context

このプロンプトの後に、比較対象の案、設計書、タスク、コード断片、制約などが添付されます。

# Constraints

- あなたは独立した比較レビューアです。
- 勝ち負けではなく、適用条件と trade-off を明確にしてください。
- 根拠のない断定を避けてください。

# Criteria

- 要件適合性
- 実装容易性
- 保守性
- テスト容易性
- リスク
- 既存構成との整合性

# Done when

- 推奨案が明確に示されている。
- trade-off とリスクが整理されている。
- 未確認事項が分かる。

# Output format

```md
## Comparison

## Recommended Option

## Trade-offs

## Risks

## Open Questions
```
