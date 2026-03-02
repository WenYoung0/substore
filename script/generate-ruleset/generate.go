package main

import (
	"flag"
	"unicode/utf8"

	"github.com/sagernet/sing/common/domain"
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
	domain.NewMatcher()
}

func reverseDomain(domain string) string {
	l := len(domain)
	b := make([]byte, l)
	for i := 0; i < l; {
		r, n := utf8.DecodeRuneInString(domain[i:])
		i += n
		utf8.EncodeRune(b[l-i:], r)
	}
	return string(b)
}
