package main

import (
	"bufio"
	"flag"
	"fmt"
	"io/fs"
	"net/netip"
	"os"
	"path/filepath"
	"strings"
)

type DomainFile struct {
	Name string
	FD   *os.File

	Domain  []string
	Suffix  []string
	KeyWord []string
	Regexp  []string
}

type IPFile struct {
	Name string
	FD   *os.File

	CIDR []netip.Prefix
}

type FileError struct {
	Reason string
	Line   int
	Raw    string
}

func (fe *FileError) Error() string {
	return fmt.Sprintf("syntax error: %s at line %d: %s", fe.Reason, fe.Line, fe.Raw)
}

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
	generateSRS  bool
	generateMRS  bool
	providerPath string
)

func main() {
	flag.BoolVar(&generateSRS, "srs", false, "Generate SRS")
	flag.BoolVar(&generateMRS, "mrs", false, "Generate MRS")
	flag.StringVar(&providerPath, "from", "./ruleset/", "Setup datasource")

	flag.Parse()
	filepath.WalkDir(filepath.Join(providerPath, "domain"), func(path string, dirEntry fs.DirEntry, err error) error {
		if dirEntry.IsDir() || err != nil || !dirEntry.Type().IsRegular() {
			return err
		}
		name := dirEntry.Name()

	})
}

func NewDomainFile(name, path string) (*DomainFile, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	domainFile := new(DomainFile)
	domainFile.FD = file
	domainFile.Name = name
	sc := bufio.NewScanner(file)
	lineCount := -1
	for sc.Scan() {
		lineCount += 1
		text := sc.Text()
		rawText := text
		if commentIndex := strings.Index(text, "#"); commentIndex != -1 {
			text = text[:commentIndex]
		}
		text = strings.TrimSpace(text)
		if text == "" {
			// skip
			continue
		}
		if idx := strings.Index(text, ":"); idx > 0 {
			trimHead := strings.ToLower(text[:idx])
			trimTail := strings.ToLower(text[idx+1:])
			switch trimHead {
			case "full":
				domainFile.Domain = append(domainFile.Domain, trimTail)
			case "keyword":
				domainFile.KeyWord = append(domainFile.KeyWord, trimTail)
			case "regexp":
				domainFile.Regexp = append(domainFile.Regexp, trimTail)
			case "":
				file.Close()
				return nil, &FileError{Reason: "empty matcher", Line: lineCount, Raw: rawText}
			default:
				file.Close()
				return nil, &FileError{Reason: "bad matcher", Line: lineCount, Raw: rawText}
			}
		} else if idx == -1 {
			domainFile.Suffix = append(domainFile.Suffix, text)
		}
	}
	return domainFile, nil
}

func NewIPFile(name, path string) (*IPFile, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	ipFile := new(IPFile)
	ipFile.Name = name
	ipFile.FD = file
	sc := bufio.NewScanner(file)
	lineCount := -1
	for sc.Scan() {
		lineCount += 1
		text := sc.Text()
		rawText := text
		if commentIndex := strings.Index(text, "#"); commentIndex != -1 {
			text = text[:commentIndex]
		}
		text = strings.TrimSpace(text)
		if text == "" {
			// skip
			continue
		}
		prefix, err := netip.ParsePrefix(text)
		if err != nil {
			file.Close()
			return nil, &FileError{Reason: err.Error(), Line: lineCount, Raw: rawText}
		}
		ipFile.CIDR = append(ipFile.CIDR, prefix)
	}
	return ipFile, nil
}
