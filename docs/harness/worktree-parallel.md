# Worktree Parallel Implementation

複数 agent で一気に実装する場合の worktree 運用方針。

## 適用範囲

タスク分解後の実装は、変更量やwave数にかかわらずtaskごとに専用worktreeを使う。同一workspaceで複数の実装workerを動かさない。

## 原則

- task ごとに独立した worktree を作る。
- 各 worktree の変更は patch として main workspace に持ち帰る。
- main workspace への反映は Codex `integration-worker` が行う。
- worktree 側で `git push`、`git commit`、`git add` はユーザー許可なしに行わない。
- task 間で同じファイルを編集する場合は、同じ wave に入れない。

## Flow

```text
docs/tasks/<run-id>/Task*.md
-> wave を選ぶ
-> task ごとに worktree を用意
-> Codex task-worker が各 worktree で実装
-> Codex reviewer が各 diff をレビュー
-> Codex integration-worker が main workspace に patch を適用
-> integration-review-agent が材料を整理し、Codex が統合レビュー
```

## Worktree Task Output

各 task は次を出力する。

```text
docs/implementation/<run-id>/TaskN.md
docs/reviews/<run-id>/implementation-review-TaskN.md
docs/implementation/<run-id>/TaskN.diff.patch
```

## Integration Notes

- patch 適用時に conflict した場合は、Codex integration-worker を停止し、Claude が衝突情報を整理して必要なら統合 task を追加する。Claude はコードを修正しない。
- conflict 解消後は、対象 task のレビューだけでなく統合レビューを再実行する。
- decisions に残した既知リスクが悪化していないか確認する。
