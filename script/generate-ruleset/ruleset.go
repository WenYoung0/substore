package main

import (
	"bufio"
	"fmt"
	"io"
	"net/netip"
	"os"
	"strings"

	"go4.org/netipx"
)

type RuleSet interface {
	WriteSRS(w io.Writer) error
	WriteMRS(w io.Writer) error
}

type PlainRuleset interface {
	RuleSet
	WritePlainTextSRS(w io.Writer) error
	WritePlainTextMRS(w io.Writer) error
}

type DomainRuleset struct {
	FD *os.File

	Domain  []string
	Suffix  []string
	KeyWord []string
	Regexp  []string
}

type IPRuleset struct {
	Name string
	FD   *os.File

	Set netipx.IPSet
}

type FileError struct {
	Reason string
	Line   int
	Raw    string
}

func (fe *FileError) Error() string {
	return fmt.Sprintf("syntax error: %s at line %d: %s", fe.Reason, fe.Line, fe.Raw)
}

func NewDomainFile(path string) (*DomainRuleset, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	domainFile := new(DomainRuleset)
	domainFile.FD = file
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

func NewIPFile(path string) (*IPRuleset, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	ipFile := new(IPRuleset)
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

		if prefix, err := netip.ParsePrefix(text); err == nil {
			ipFile.CIDR = append(ipFile.CIDR, prefix)
			continue
		}
		if ip, err := netip.ParseAddr(text); err == nil {
			ipFile.IP = append(ipFile.IP, ip)
			continue
		}

		file.Close()
		return nil, &FileError{Reason: "bad ip address or cidr", Line: lineCount, Raw: rawText}
	}
	return ipFile, nil
}
