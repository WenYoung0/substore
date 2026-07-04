.PHONY: all
all: install_binary bundle_build ruleset check

.PHONY: bundle_build
bundle_build:
	cd script/bundle-build && npm install && node main.js

.PHONY: check
check:
	.test/bin/sing-box check -c internal/cores/box/box.json
	.test/bin/sing-box check -c internal/cores/box/enhanced.json
	.test/bin/sing-box check -c internal/cores/box/minimal.json
	.test/bin/mihomo -t -f internal/cores/cat/cat.yaml

.PHONY: ruleset
ruleset: clean_ruleset
	cd script/generate-ruleset && go mod tidy && RULESET_SILENT_WARN=1 go run . --from "../../ruleset/data" --output "../../ruleset" --srs --mrs --all
	cd script/fill-ruleset && node main.js

.PHONY: clean_ruleset
clean_ruleset:
	rm -rf ruleset/domain ruleset/ip 

.PHONY: install_binary
install_binary:
	cd script/ && go run installBinary.go