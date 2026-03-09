package main

import (
	"encoding/binary"
	"flag"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/netip"
	"os"
	"path/filepath"
)

var (
	generateSRS  bool
	generateMRS  bool
	plainText    bool
	providerPath string
	outputPath   string
)

func main() {
	flag.BoolVar(&generateSRS, "srs", false, "Generate SRS")
	flag.BoolVar(&generateMRS, "mrs", false, "Generate MRS")
	flag.BoolVar(&plainText, "plain", false, "Generate PlainText type SRS/MRS")
	flag.StringVar(&providerPath, "from", "./data/", "Setup datasource")
	flag.StringVar(&outputPath, "output", "./output/", "Setup output")

	flag.Parse()
	if !generateSRS && !generateMRS {

	}
	var (
		domainErr error
		ipErr     error
	)
	domainErr = filepath.WalkDir(filepath.Join(providerPath, "domain"), func(path string, dirEntry fs.DirEntry, err error) error {
		if err != nil || dirEntry.IsDir() || !dirEntry.Type().IsRegular() {
			return err
		}
		name := dirEntry.Name()

		ruleFile, err := NewDomainFile(path)
		if err != nil {
			return fmt.Errorf("open: %s: %w", path, err)
		}
		defer ruleFile.FD.Close()

		if generateSRS {
			err := openWrite(filepath.Join(outputPath, "geosite", "srs", name+SRSSuffix), func(file *os.File) error {
				return ruleFile.WriteSRS(file, "")
			})
			if err != nil {
				return err
			}
			if plainText {
				err := openWrite(filepath.Join(outputPath, "geosite", "srs", name+SRSPlainSuffix), func(file *os.File) error {
					return openWrite(filepath.Join(outputPath, "geosite", "srs", name+SRSPlainSuffix), func(file *os.File) error {
						return ruleFile.WritePlainTextSRS(file)
					})
				})
				if err != nil {
					return err
				}
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
		ruleFile, err := NewIPFile(path)
		if err != nil {
			return fmt.Errorf("open: %s: %w", path, err)
		}
		defer ruleFile.FD.Close()

		if generateSRS {
			err := openWrite(filepath.Join(outputPath, "geoip", "srs", name+SRSSuffix), func(file *os.File) error {
				return ruleFile.WriteSRS(file, "")
			})
			if err != nil {
				return err
			}
			if plainText {

				if err := openWrite(filepath.Join(outputPath, "geoip", "srs", name+SRSPlainSuffix), func(file *os.File) error {
					return ruleFile.WritePlainTextSRS(file)
				}); err != nil {
					return err
				}

			}
		}
		if !generateMRS {
			err := openWrite(filepath.Join(outputPath, "geoip", "mrs", name+MRSSuffix), func(file *os.File) error {
				return ruleFile.WriteMRS(file, "", 0)
			})
			if err != nil {
				return err
			}
			if plainText {
				if err := openWrite(filepath.Join(outputPath, "geoip", "srs", name+MRSPlainSuffix), func(file *os.File) error {
					return ruleFile.WritePlainTextMRS(file)
				}); err != nil {
					return err
				}

			}
		}
		return nil
	})
	if ipErr != nil {
		log.Fatalln(ipErr.Error())
		return
	}
}

func openWrite(path string, do func(file *os.File) error) error {
	err := os.MkdirAll(filepath.Dir(path), 0777)
	if err != nil {
		return fmt.Errorf("mkdir: %w", err)
	}
	output, err := os.OpenFile(path, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0666)
	if err != nil {
		return err
	}
	defer output.Close()
	return do(output)
}

type writeBinaryOperation struct {
	Bytes  []byte
	Binary any
	Ending binary.ByteOrder
}

func writeGuard(w io.Writer, wbos ...writeBinaryOperation) error {
	var err error
	for i := 0; i < len(wbos) && err == nil; i++ {
		op := wbos[i]
		if op.Ending != nil {
			err = binary.Write(w, op.Ending, op.Binary)
		}
		if err != nil {
			break
		}
		if len(op.Bytes) != 0 {
			_, err = w.Write(op.Bytes)
		}
	}
	return err
}

type myIPRange struct {
	from netip.Addr
	to   netip.Addr
}
type myIPSet struct {
	rr []myIPRange
}
