; ▷ in the gutter. `main()` of a Dragonfly project runs the app; `@test("name")`, `@widget(...)` and `@states(...)`
; run that one test (the name goes to the task as $ZED_CUSTOM_test_name).
(
  (source_file (identifier) @run @_main . (parenthesized))
  (#eq? @_main "main")
  (#set! tag dragonfly-main)
)

(
  (source_file
    (decorator) @run @_decorator
    .
    (parenthesized . "(" . (string (string_content) @test_name)))
  (#match? @_decorator "^@(test|widget|states)$")
  (#set! tag dragonfly-test)
)
