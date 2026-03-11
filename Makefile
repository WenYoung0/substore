.PHONY: ruleset
ruleset:
	cd script/generate-ruleset && go mod tidy && go run . --from "./testdata" --output "./testoutput" --srs --mrs --all
	cd script/fill-ruleset && node main.js