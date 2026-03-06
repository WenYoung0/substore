package main

import (
	"flag"
	"fmt"
	"io/fs"
	"log"
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
		return
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
		var (
			df     *DomainRuleset
			output *os.File
		)
		df, err = NewDomainFile(path)
		if err != nil {
			return fmt.Errorf("open: %s: %w", path, err)
		}
		defer df.FD.Close()

		if generateSRS {
			outputFilePath := filepath.Join(outputPath, "geosite", "srs", name+".srs")
			err = os.MkdirAll(filepath.Dir(outputFilePath), 0777)
			if err != nil {
				return fmt.Errorf("mkdir: %w", err)
			}
			output, err = os.OpenFile(outputFilePath, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0666)
			if err != nil {
				return err
			}
			defer output.Close()
			err = df.WriteSRS(output)
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
			df     *IPRuleset
			output *os.File
		)
		df, err = NewIPFile(path)
		if err != nil {
			return fmt.Errorf("open: %s: %w", path, err)
		}
		defer df.FD.Close()

		if generateSRS {
			err := openWrite(filepath.Join(outputPath, "geoip", "srs", name+SRSSuffix), func(file *os.File) error {
				err := df.WriteSRS(output)
				if err != nil {
					return fmt.Errorf("write: %s: %w", file.Name(), err)
				}
				return nil
			})
			if err != nil {
				return err
			}
			if plainText {
				err := openWrite(filepath.Join(outputPath, "geoip", "srs", name+SRSPlainSuffix), func(file *os.File) error {
					err := df.WritePlainTextSRS(file)
					if err != nil {
						return fmt.Errorf("write_plain: %s: %w", file.Name(), err)
					}
					return nil
				})
				if err != nil {
					return err
				}

			}
		}
		if generateMRS {
			err := openWrite(filepath.Join(outputPath, "geoip", "mrs", name+MRSSuffix), func(file *os.File) error {
				err := df.WriteMRS(output)
				if err != nil {
					return fmt.Errorf("write: %s: %w", file.Name(), err)
				}
				return nil
			})
			if err != nil {
				return err
			}
			if plainText {
				err := openWrite(filepath.Join(outputPath, "geoip", "srs", name+MRSPlainSuffix), func(file *os.File) error {
					err := df.WritePlainTextMRS(file)
					if err != nil {
						return fmt.Errorf("write_plain: %s: %w", file.Name(), err)
					}
					return nil
				})
				if err != nil {
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
