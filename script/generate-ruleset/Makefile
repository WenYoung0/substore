.PHONY: generate
generate:
	@go mod tidy
	@go run . --from "../../ruleset/data" --output "../../ruleset" --srs --mrs


.PHONY: testrun
testrun:
	@go mod tidy
	@go run . --from "./testdata" --output "./testoutput" --srs --mrs

.PHONY: fmt
fmt:
	go fmt .
