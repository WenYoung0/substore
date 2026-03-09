package main

import (
	"bufio"
	"bytes"
	"encoding/binary"
	"errors"
	"fmt"
	"generate_ruleset/trie"
	"generate_ruleset/trie/cidr"
	"io"
	"net/netip"
	"strings"
	"unsafe"

	"github.com/goccy/go-yaml"
	"github.com/klauspost/compress/zstd"
	"github.com/sagernet/sing/common"
)

var MRSMagicBytes = [4]byte{'M', 'R', 'S', 1} // MRSv1

var (
	ErrNotSupportKeyword = errors.New("format doesn't support keyword type")
	ErrNotSupportRegexp  = errors.New("format doesn't support regexp type")
)

const (
	MRSRuleBehaviorDomain    int = 0
	MRSRuleBehaviorIP        int = 1
	MRSRuleBehaviorClassical int = 2

	MRSPlainFormatYAML = "yaml"
	MRSPlainFormatText = "text"

	MRSSuffix               = ".mrs"
	MRSPlainSuffixClassical = ".classical"
	MRSPlainSuffixText      = ".list"
	MRSPlainSuffixYaml      = ".yaml"
)

type MrsPlainTextRuleset struct {
	Domain        []string
	DomainSuffix  []string
	DomainKeyword []string
	DomainRegexp  []string
	IPCidr        []string

	Behavior int

	Payload []string
}

func (m *MrsPlainTextRuleset) MarshalText() ([]byte, error) {
	if err := m.fill(); err != nil {
		return nil, err
	}
	length := 0
	for i := 0; i < len(m.Payload); i++ {
		length += len(m.Payload[i]) + 1
	}
	buffer := bytes.NewBuffer(make([]byte, length))
	buffer.Reset()
	for i := 0; i < len(m.Payload); i++ {
		const LF = '\n'
		buffer.WriteString(m.Payload[i])
		buffer.WriteByte(LF)
	}
	return buffer.Bytes(), nil
}

func (m *MrsPlainTextRuleset) MarshalYAML() ([]byte, error) {
	if err := m.fill(); err != nil {
		return nil, err
	}

	type schema struct {
		Payload []string `yaml:"payload"`
	}

	return yaml.Marshal(&schema{m.Payload})
}

func (m *MrsPlainTextRuleset) fill() error {
	switch m.Behavior {
	case MRSRuleBehaviorDomain:
		return m.fillDomainPayload()
	case MRSRuleBehaviorIP:
		m.fillIPPayload()
	case MRSRuleBehaviorClassical:
		m.fillClassical()
	}
	return fmt.Errorf("unexcepted behavior: %d", m.Behavior)
}

func (m *MrsPlainTextRuleset) fillDomainPayload() error {
	switch {
	case len(m.DomainKeyword) > 0 && len(m.DomainRegexp) > 0:
		return fmt.Errorf("behavior `domain` only support `suffix` and `full` match, use classical instead: (%w, %w)", ErrNotSupportRegexp, ErrNotSupportKeyword)
	case len(m.DomainKeyword) > 0:
		return fmt.Errorf("behavior `domain` only support `suffix` and `full` match, use classical instead: %w", ErrNotSupportKeyword)
	case len(m.DomainRegexp) > 0:
		return fmt.Errorf("behavior `domain` only support `suffix` and `full` match, use classical instead: %w", ErrNotSupportRegexp)
	}
	m.Payload = make([]string, 0, len(m.Domain)+len(m.DomainSuffix))
	for i := 0; i < len(m.Domain); i++ {
		m.Payload = append(m.Payload, m.Domain[i])
	}
	for i := 0; i < len(m.DomainSuffix); i++ {
		suffix := m.DomainSuffix[i]
		if !strings.HasPrefix(suffix, ".") {
			suffix = "+." + suffix
		}
		m.Payload = append(m.Payload, suffix)
	}

	return nil
}

func (m *MrsPlainTextRuleset) fillClassical() {
	m.Payload = make([]string, 0, len(m.Domain)+len(m.DomainSuffix)+len(m.DomainKeyword)+len(m.DomainRegexp)+len(m.IPCidr))

	for i := 0; i < len(m.IPCidr); i++ {
		m.Payload = append(m.Payload, "IP-CIDR,"+m.IPCidr[i])
	}
	for i := 0; i < len(m.Domain); i++ {
		m.Payload = append(m.Payload, "DOMAIN,"+m.Domain[i])
	}
	for i := 0; i < len(m.DomainSuffix); i++ {
		m.Payload = append(m.Payload, "DOMAIN-SUFFIX,"+m.DomainSuffix[i])
	}
	for i := 0; i < len(m.DomainKeyword); i++ {
		m.Payload = append(m.Payload, "DOMAIN-KEYWORD,"+m.DomainKeyword[i])
	}
	for i := 0; i < len(m.DomainRegexp); i++ {
		m.Payload = append(m.Payload, "DOMAIN-REGEX,"+m.DomainRegexp[i])
	}
}
func (m *MrsPlainTextRuleset) fillIPPayload() {
	m.Payload = make([]string, 0, len(m.IPCidr))
	copy(m.Payload[:len(m.IPCidr)], m.IPCidr)
}

func (rule *DomainRuleset) WriteMRS(w io.Writer) error {
	if rule.Count() == 0 {
		return ErrEmpty
	}
	switch {
	case len(rule.KeyWord) != 0:
		return fmt.Errorf("%s %w", "MRS", ErrNotSupportKeyword)
	case len(rule.Regexp) != 0:
		return fmt.Errorf("%s %w", "MRS", ErrNotSupportRegexp)
	}
	zstdWriter, err := prepareMRS(w, MRSRuleBehaviorDomain, rule.Count())
	if err != nil {
		return err
	}
	domainTrie := new(trie.DomainTrie[struct{}])
	for i := 0; i < len(rule.Domain); i++ {
		domain := rule.Domain[i]
		err := domainTrie.Insert(domain, struct{}{})
		if err != nil {
			return err
		}
	}
	for i := 0; i < len(rule.Suffix); i++ {
		domainSuffix := rule.Domain[i]
		err := domainTrie.Insert("+."+domainSuffix, struct{}{})
		if err != nil {
			return err
		}
	}
	set := domainTrie.NewDomainSet()
	bufWriter := bufio.NewWriter(w)
	err = set.WriteBin(bufWriter)
	if err != nil {
		return err
	}
	err = bufWriter.Flush()
	if err != nil {
		return err
	}

	return zstdWriter.Close()
}

func (rule *DomainRuleset) WritePlainTextMRS(w io.Writer, format string, behavior int) error {
	if rule.Count() == 0 {
		return ErrEmpty
	}

	var (
		ruleset = &MrsPlainTextRuleset{
			Domain:        rule.Domain,
			DomainSuffix:  rule.Suffix,
			DomainKeyword: rule.KeyWord,
			DomainRegexp:  rule.Regexp,
			Behavior:      behavior,
		}
		text []byte
		err  error
	)
	switch format {
	case MRSPlainFormatText:
		text, err = ruleset.MarshalText()
	case MRSPlainFormatYAML:
		text, err = ruleset.MarshalYAML()
	default:
		return fmt.Errorf("unexcepted format: %s", format)
	}
	if err != nil {
		return err
	}
	_, err = w.Write(text)
	return err
}

func (rule *IPRuleset) WriteMRS(w io.Writer) error {
	if rule.Set == nil {
		return fmt.Errorf("empty")
	}
	trieIPCidr := (*cidr.IpCidrSet)(unsafe.Pointer(rule.Set))
	myIPSetv := (*myIPSet)(unsafe.Pointer(rule.Set))

	zstdEncoder, err := prepareMRS(w, MRSRuleBehaviorIP, int64(len(myIPSetv.rr)))
	if err != nil {
		return err
	}
	bufWriter := bufio.NewWriter(zstdEncoder)
	err = trieIPCidr.WriteBin(bufWriter)
	if err != nil {
		return err
	}
	err = bufWriter.Flush()
	if err != nil {
		return err
	}

	return zstdEncoder.Close()
}

func (rule *IPRuleset) WritePlainTextMRS(w io.Writer, format string, behavior int) error {
	if rule.Set == nil {
		return ErrEmpty
	}

	var (
		ruleset = &MrsPlainTextRuleset{
			IPCidr:   common.Map(rule.Set.Prefixes(), netip.Prefix.String),
			Behavior: behavior,
		}
		text []byte
		err  error
	)
	switch format {
	case MRSPlainFormatText:
		text, err = ruleset.MarshalText()
	case MRSPlainFormatYAML:
		text, err = ruleset.MarshalYAML()
	default:
		return fmt.Errorf("unexcepted format: %s", format)
	}
	if err != nil {
		return err
	}
	_, err = w.Write(text)
	return err
}

func prepareMRS(w io.Writer, behavior int, count int64) (*zstd.Encoder, error) {
	zstdEncoder, err := zstd.NewWriter(w)
	if err != nil {
		return nil, err
	}
	var extra []byte
	err = writeGuard(zstdEncoder,
		writeBinaryOperation{Bytes: MRSMagicBytes[:]},
		writeBinaryOperation{Bytes: []byte{behaviorToByte(behavior)}},
		writeBinaryOperation{Binary: int64(count), Ending: binary.BigEndian},
		writeBinaryOperation{Binary: int64(len(extra)), Ending: binary.BigEndian, Bytes: extra},
	)
	if err != nil {
		return nil, err
	}

	return zstdEncoder, nil
}

func behaviorToByte(b int) byte {
	switch b {
	case 0:
		return byte(0)
	case 1:
		return byte(1)
	default:
		panic("unknown behavior")
	}
}
