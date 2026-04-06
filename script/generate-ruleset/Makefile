.PHONY: generate
generate:
	@go mod tidy
	@go run . --from "../../ruleset/data" --output "../../ruleset" --srs --mrs --all

.PHONY: testrun
testrun:
	@go mod tidy
	@go run . --from "./testdata" --output "./testoutput" --srs --mrs --all

.PHONY: fmt
fmt:
	go fmt .
