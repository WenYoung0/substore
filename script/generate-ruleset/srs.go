package main

import (
	"bufio"
	"compress/zlib"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"io"
	"net/netip"
	"strings"
	"unsafe"

	"github.com/sagernet/sing/common/domain"
	"github.com/sagernet/sing/common/varbin"
	"go4.org/netipx"
)

type PlainTextSrs struct {
	Version       uint8    `json:"version"`
	Domain        []string `json:"domain,omitempty"`
	DomainSuffix  []string `json:"domain_suffix,omitempty"`
	DomainKeyword []string `json:"domain_keyword,omitempty"`
	DomainRegexp  []string `json:"domain_regexp,omitempty"`
	IPCidr        []string `json:"ip_cidr,omitempty"`
}

var (
	SRSMagicBytes = [3]byte{0x53, 0x52, 0x53}
)

const (
	SRSSuffix      = ".srs"
	SRSPlainSuffix = ".json"
)

const (
	SRSRuleItemDomain uint8 = 2 + iota
	SRSRuleItemDomainKeyword
	SRSRuleItemDomainRegex
	SRSRuleItemIPCIDR uint8 = 6

	SRSRuleItemFinal uint8 = 0xFF

	SRSCurrentVersion uint8 = 4
)

func (rule *DomainRuleset) WriteSRS(w io.Writer) error {
	if len(rule.Domain) == 0 && len(rule.Suffix) == 0 && len(rule.KeyWord) == 0 && len(rule.Regexp) == 0 {
		return fmt.Errorf("empty")
	}
	gzipWriter, err := prepareSRS(w, 1, SRSCurrentVersion)
	if err != nil {
		return err
	}
	bufWriter := bufio.NewWriter(gzipWriter)
	err = rule.writeSRSRule(bufWriter)
	if err != nil {
		gzipWriter.Close()
		return err
	}
	err = bufWriter.Flush()
	if err != nil {
		gzipWriter.Close()
		return err
	}
	return gzipWriter.Close()
}

func (rule *DomainRuleset) WritePlainTextSRS(w io.Writer) error {
	var buffer = bufio.NewWriter(w)
	encoder := json.NewEncoder(buffer)
	encoder.SetIndent("", strings.Repeat(" ",2))
	err := encoder.Encode(&PlainTextSrs{
		Version:       SRSCurrentVersion,
		Domain:        rule.Domain,
		DomainSuffix:  rule.Suffix,
		DomainKeyword: rule.KeyWord,
		DomainRegexp:  rule.Regexp,
	})
	if err != nil {
		return err
	}
	return buffer.Flush()
}

func (rule *DomainRuleset) writeSRSRule(w varbin.Writer) error {
	err := binary.Write(w, binary.BigEndian, uint8(0))
	if err != nil {
		return err
	}
	if len(rule.Domain) > 0 || len(rule.Suffix) > 0 {
		err = binary.Write(w, binary.BigEndian, SRSRuleItemDomain)
		if err != nil {
			return err
		}
		err = domain.NewMatcher(rule.Domain, rule.Suffix, false).Write(w)
		if err != nil {
			return err
		}
	}
	if len(rule.KeyWord) > 0 {
		err = srsWriteRuleItemString(w, SRSRuleItemDomainKeyword, rule.KeyWord)
		if err != nil {
			return err
		}
	}
	if len(rule.Regexp) > 0 {
		err = srsWriteRuleItemString(w, SRSRuleItemDomainRegex, rule.Regexp)
		if err != nil {
			return err
		}
	}
	err = binary.Write(w, binary.BigEndian, SRSRuleItemFinal)
	if err != nil {
		return err
	}
	// err = binary.Write(writer, binary.BigEndian, rule.Invert)
	return binary.Write(w, binary.BigEndian, false)
}

func (rule *IPRuleset) WriteSRS(w io.Writer) error {
	if len(rule.CIDR) == 0 && len(rule.IP) == 0 {
		return fmt.Errorf("empty")
	}
	var ipxset netipx.IPSetBuilder
	for _, ip := range rule.CIDR {
		ipxset.AddPrefix(ip)
	}
	for _, ip := range rule.IP {
		ipxset.Add(ip)
	}
	ipset, err := ipxset.IPSet()
	if err != nil {
		return err
	}

	gzipWriter, err := prepareSRS(w, 1, SRSCurrentVersion)
	if err != nil {
		return err
	}
	bufWriter := bufio.NewWriter(gzipWriter)
	err = rule.writeSrs(bufWriter, ipset)
	if err != nil {
		return err
	}
	err = bufWriter.Flush()
	if err != nil {
		return err
	}

	return gzipWriter.Close()
}

func (rule *IPRuleset) WritePlainTextSRS(w io.Writer) error {
	cidrs := make([]string,len(rule.IP) + len(rule.CIDR))


	buffer := bufio.NewWriter(w)
	encoder := json.NewEncoder(buffer)
	encoder.SetIndent("", strings.Repeat(" ",2))
	err := encoder.Encode(&PlainTextSrs{
		Version:       SRSCurrentVersion,
		IPCidr: rule.CIDR
	})
	if err != nil {
		return err
	}
	return buffer.Flush()
}

func (rule *IPRuleset) writeSrs(w varbin.Writer, set *netipx.IPSet) error {
	err := binary.Write(w, binary.BigEndian, uint8(0))
	if err != nil {
		return err
	}
	err = binary.Write(w, binary.BigEndian, SRSRuleItemIPCIDR)
	if err != nil {
		return err
	}
	err = writeIPSet(w, set)
	if err != nil {
		return err
	}
	err = binary.Write(w, binary.BigEndian, SRSRuleItemFinal)
	if err != nil {
		return err
	}
	// err = binary.Write(writer, binary.BigEndian, rule.Invert)
	return binary.Write(w, binary.BigEndian, false)
}

func srsWriteRuleItemString(writer varbin.Writer, itemType uint8, value []string) error {
	err := writer.WriteByte(itemType)
	if err != nil {
		return err
	}
	_, err = varbin.WriteUvarint(writer, uint64(len(value)))
	if err != nil {
		return err
	}
	for _, s := range value {
		_, err = varbin.WriteUvarint(writer, uint64(len(s)))
		if err != nil {
			return err
		}
		_, err = writer.Write([]byte(s))
		if err != nil {
			return err
		}
	}
	return nil
}

func writeIPSet(w varbin.Writer, set *netipx.IPSet) error {
	type myIPRange struct {
		from netip.Addr
		to   netip.Addr
	}
	type myIPSet struct {
		rr []myIPRange
	}

	err := w.WriteByte(1)
	if err != nil {
		return err
	}

	mySet := (*myIPSet)(unsafe.Pointer(set))
	err = binary.Write(w, binary.BigEndian, uint64(len(mySet.rr)))
	if err != nil {
		return err
	}
	for _, rr := range mySet.rr {
		fromBytes := rr.from.AsSlice()
		_, err = varbin.WriteUvarint(w, uint64(len(fromBytes)))
		if err != nil {
			return err
		}
		_, err = w.Write(fromBytes)
		if err != nil {
			return err
		}
		toBytes := rr.to.AsSlice()
		_, err = varbin.WriteUvarint(w, uint64(len(toBytes)))
		if err != nil {
			return err
		}
		_, err = w.Write(toBytes)
		if err != nil {
			return err
		}
	}
	return nil
}

type dummyVarbinWriter struct {
	io.Writer
}

func (d *dummyVarbinWriter) WriteByte(c byte) error {
	_, err := d.Writer.Write([]byte{c})
	return err
}

func prepareSRS(w io.Writer, itemCount uint64, ver uint8) (*zlib.Writer, error) {
	_, err := w.Write(SRSMagicBytes[:])
	if err != nil {
		return nil, err
	}
	err = binary.Write(w, binary.BigEndian, ver)
	if err != nil {
		return nil, err
	}
	compressWriter, err := zlib.NewWriterLevel(w, zlib.BestCompression)
	if err != nil {
		return nil, err
	}
	_, err = varbin.WriteUvarint(&dummyVarbinWriter{Writer: compressWriter}, itemCount)
	if err != nil {
		return nil, err
	}
	return compressWriter, nil
}
