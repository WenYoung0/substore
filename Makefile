.PHONY: ruleset
ruleset:
	cd script/generate-ruleset && go mod tidy && RULESET_SILENT_WARN=1 go run . --from "../../ruleset/data" --output "../../ruleset" --srs --mrs --all
	cd script/fill-ruleset && node main.js
	sing-box check -c internal/cores/box/box.json
	sing-box check -c internal/cores/box/enhanced.json
	sing-box check -c internal/cores/box/mininal.json
	mihomo -t -f internal/cores/cat/cat.yaml