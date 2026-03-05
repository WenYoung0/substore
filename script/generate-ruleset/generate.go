package main

import (
	"bufio"
	"compress/zlib"
	"encoding/binary"
	"flag"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/netip"
	"os"
	"path/filepath"
	"strings"
	"unsafe"

	"github.com/sagernet/sing/common/domain"
	"github.com/sagernet/sing/common/varbin"
	"go4.org/netipx"
)

var (
	SRSMagicBytes = [3]byte{0x53, 0x52, 0x53}
)

const (
	SRSRuleItemDomain uint8 = 2 + iota
	SRSRuleItemDomainKeyword
	SRSRuleItemDomainRegex
	SRSRuleItemIPCIDR uint8 = 6

	SRSRuleItemFinal uint8 = 0xFF

	SRSCurrentVersion = 4
)

type DomainFile struct {
	FD *os.File

	Domain  []string
	Suffix  []string
	KeyWord []string
	Regexp  []string
}

func (rule *DomainFile) WriteSRS(w io.Writer, ver uint8) error {
	if len(rule.Domain) == 0 && len(rule.Suffix) == 0 && len(rule.KeyWord) == 0 && len(rule.Regexp) == 0 {
		return fmt.Errorf("empty")
	}
	gzipWriter, err := prepareSRS(w, 1, ver)
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

func (rule *DomainFile) writeSRSRule(w varbin.Writer) error {
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

type IPFile struct {
	Name string
	FD   *os.File

	CIDR []netip.Prefix
	IP   []netip.Addr
}

func (rule *IPFile) WriteSRS(w io.Writer, ver uint8) error {
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

	gzipWriter, err := prepareSRS(w, 1, ver)
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

func (rule *IPFile) writeSrs(w varbin.Writer, set *netipx.IPSet) error {
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

type FileError struct {
	Reason string
	Line   int
	Raw    string
}

func (fe *FileError) Error() string {
	return fmt.Sprintf("syntax error: %s at line %d: %s", fe.Reason, fe.Line, fe.Raw)
}

var (
	generateSRS  bool
	generateMRS  bool
	providerPath string
	outputPath   string
)

func main() {
	flag.BoolVar(&generateSRS, "srs", false, "Generate SRS")
	flag.BoolVar(&generateMRS, "mrs", false, "Generate MRS")
	flag.StringVar(&providerPath, "from", "./data/", "Setup datasource")
	flag.StringVar(&outputPath, "output", "./output/", "Setup output")

	flag.Parse()
	var (
		domainErr error
		ipErr     error
	)
	domainErr = filepath.WalkDir(filepath.Join(providerPath, "domain"), func(path string, dirEntry fs.DirEntry, err error) error {
		if err != nil || dirEntry.IsDir() || !dirEntry.Type().IsRegular() {
			return err
		}
		name := dirEntry.Name()
		var (
			df     *DomainFile
			output *os.File
		)
		df, err = NewDomainFile(path)
		if err != nil {
			return fmt.Errorf("open: %s: %w", path, err)
		}

		if generateSRS {
			outputFilePath := filepath.Join(outputPath, "geosite", "srs", name+".srs")
			err = os.MkdirAll(filepath.Dir(outputFilePath), 0777)
			if err != nil {
				return fmt.Errorf("mkdir: %w", err)
			}
			output, err = os.OpenFile(outputFilePath, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0666)
			err = df.WriteSRS(output, SRSCurrentVersion)
			if err != nil {
				return fmt.Errorf("handle: %s: %w", name, err)
			}
		}
		if generateMRS {
			fmt.Println("todo")
		}
		return nil
	})
	if domainErr != nil {
		log.Fatalln(domainErr.Error())
		return
	}
	ipErr = filepath.WalkDir(filepath.Join(providerPath, "ip"), func(path string, dirEntry fs.DirEntry, err error) error {
		if err != nil || dirEntry.IsDir() || !dirEntry.Type().IsRegular() {
			return err
		}
		name := dirEntry.Name()
		var (
			df     *IPFile
			output *os.File
		)
		df, err = NewIPFile(path)
		if err != nil {
			return fmt.Errorf("open: %s: %w", path, err)
		}

		if generateSRS {
			outputFilePath := filepath.Join(outputPath, "geoip", "srs", name+".srs")
			err = os.MkdirAll(filepath.Dir(outputFilePath), 0777)
			if err != nil {
				return fmt.Errorf("mkdir: %w", err)
			}
			output, err = os.OpenFile(outputFilePath, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0666)
			err = df.WriteSRS(output, SRSCurrentVersion)
			if err != nil {
				return fmt.Errorf("handle: %s: %w", name, err)
			}
		}
		if generateMRS {
			fmt.Println("todo")
		}
		return nil
	})
	if ipErr != nil {
		log.Fatalln(ipErr.Error())
		return
	}
}

func NewDomainFile(path string) (*DomainFile, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	domainFile := new(DomainFile)
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

func NewIPFile(path string) (*IPFile, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	ipFile := new(IPFile)
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
