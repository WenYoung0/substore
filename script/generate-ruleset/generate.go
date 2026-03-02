package main

import (
	"flag"
)

const (
	SRSRuleItemDomain uint8 = 2 + iota
	SRSRuleItemDomainKeyword
	SRSRuleItemDomainRegex
	SRSRuleItemFinal uint8 = 0xFF
)

var (
	srsMagicBytes = [3]byte{0x53, 0x52, 0x53}
)

var (
	generateSRS *bool = flag.Bool("srs", false, "Generate SRS")
	generateMRS *bool = flag.Bool("mrs", false, "Genertae MRS")
)

func main() {
}
