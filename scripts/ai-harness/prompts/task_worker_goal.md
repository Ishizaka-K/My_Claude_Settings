# Goal

指定された Task を完了条件まで実装してください。

この mode は、1 Task = 1 Codex worker で `/goal` を使って task 完了まで走ることを想定しています。

# Context

このプロンプトの後に、設計書、ユースケース、対象 Task、decisions、関連ファイル、エラー、テスト結果などが添付されます。

# Constraints

- task 専用 worktree/sandbox 内でのみ編集してください。
- main workspace を直接編集しないでください。
- `Owned Files` を主な編集範囲にしてください。
- `Out of Scope` に書かれた変更をしないでください。
- unrelated な整形、リネーム、削除をしないでください。
- `git add`、`git commit`、`git push` を実行しないでください。
- 既存の設計、命名、ファイル構成、テスト方針に合わせてください。
- 仕様判断や scope 変更が必要な場合は、実装を止めて質問事項として報告してください。
- sandbox や permission によりコマンドが失敗した場合、承認待ちにせず、失敗内容と代替案を報告してください。

# Verification

- 対象 Task の `Acceptance Criteria` を満たしている。
- 指定されたテストまたは静的チェックが通っている。
- 最も速い関連テストから実行し、必要な範囲へ広げる。

# Stop Conditions

- Acceptance Criteria と Verification をすべて満たしたら完了する。
- 仕様判断、scope 変更、破壊的変更が必要なら停止して質問する。
- sandbox、permission、外部依存により続行できない場合は、承認待ちにせず停止して報告する。
- 最終報告には次を含める。
- 変更ファイルが報告されている。
- 検証結果が報告されている。
- 未確認事項や残リスクが報告されている。
- main workspace に統合可能な diff が残っている。

# Output format

```md
## Summary

## Changed Files

## Verification

## Diff Summary

## Remaining Issues

## Questions
```

レポートの後、最終行に次のいずれかを必ず1つだけ出力してください。

```text
CODEX_RESULT: COMPLETE
CODEX_RESULT: BLOCKED
CODEX_RESULT: FAILED
```

- `COMPLETE`: Acceptance CriteriaとVerificationを満たした。
- `BLOCKED`: ユーザー判断、permission、外部依存などで続行できない。
- `FAILED`: 実装または検証に失敗し、task範囲内で回復できない。
