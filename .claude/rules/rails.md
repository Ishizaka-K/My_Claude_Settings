---
paths:
  - "**/*.rb"
  - "**/Gemfile"
  - "**/config/routes.rb"
  - "**/db/migrate/*.rb"
---

# Ruby on Rails Rules

- Rails の標準構成と convention を優先する。
- Controller に業務ロジックを詰め込みすぎない。
- Model には永続化対象のルール、関連、バリデーションを置く。
- 複雑なユースケースは必要に応じて service/form/query object に切り出す。
- DB 制約と model validation の両方を検討する。
- N+1、認可漏れ、mass assignment、SQL injection、XSS、CSRF に注意する。
- migration はデータ量、ロック、ロールバック可能性を考慮する。
- Request test、Model test、重要フローの System test を優先する。

