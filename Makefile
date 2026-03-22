BOX_VERSION=1.13.3
CAT_VERSION=


.PHONY: ruleset
ruleset: clean_ruleset
	cd script/generate-ruleset && go mod tidy && RULESET_SILENT_WARN=1 go run . --from "../../ruleset/data" --output "../../ruleset" --srs --mrs --all
	cd script/fill-ruleset && node main.js
	.test/bin/sing-box check -c internal/cores/box/box.json
	.test/bin/sing-box check -c internal/cores/box/enhanced.json
	.test/bin/sing-box check -c internal/cores/box/mininal.json
	.test/bin/mihomo -t -f internal/cores/cat/cat.yaml

.PHONY: clean_ruleset
clean_ruleset:
	rm -rf ruleset/domain ruleset/ip 

.PHONY: deploy_binary
deploy_binary:
	