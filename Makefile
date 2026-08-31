GIT_BRANCH=$(shell git branch --show-current)
REPO_NAME=duakc/substore

.PHONY: all
all: install_binary bundle minimal check

.PHONY: bundle
bundle: bundle_script ruleset

.PHONY: bundle_script
bundle_script:
	cd script/bundle-build && npm install && node main.js

.PHONY: minimal
minimal:
	cd script/minimal-build && npm install && node ../minimal.js

.PHONY: check
check:
	.test/bin/sing-box check -c internal/cores/box/box.json
	.test/bin/sing-box check -c internal/cores/box/enhanced.json
	.test/bin/sing-box check -c internal/cores/box/minimal.json
	.test/bin/sing-box check -c internal/cores/box/box.min.json
	.test/bin/sing-box check -c internal/cores/box/enhanced.min.json
	.test/bin/sing-box check -c internal/cores/box/minimal.min.json
	.test/bin/mihomo -t -f internal/cores/cat/cat.yaml
	.test/bin/mihomo -t -f internal/cores/cat/cat.min.yaml

.PHONY: ruleset
ruleset: clean_ruleset
	cd script/generate-ruleset && go mod tidy && RULESET_SILENT_WARN=1 go run . --from "../../ruleset/data" --output "../../ruleset" --srs --mrs --all
	cd script/fill-ruleset && npm install && node main.js

.PHONY: clean_ruleset
clean_ruleset:
	rm -rf ruleset/domain ruleset/ip 

.PHONY: install_binary
install_binary:
	cd script/ && go run installBinary.go
