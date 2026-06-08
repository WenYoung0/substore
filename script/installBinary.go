package main

import (
	"archive/tar"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
)

var (
	input  = "../cores.json"
	output = "../.test/bin"
)

type Core struct {
	Type       string `json:"type"`
	BinaryName string `json:"binary_name"`
	Version    string `json:"version"`
}

func main() {
	file, err := os.Open(input)
	if err != nil {
		log.Fatalln(err)
	}
	defer file.Close()
	type schema struct {
		Cores []Core `json:"cores"`
	}
	var v schema
	decoder := json.NewDecoder(file)
	err = decoder.Decode(&v)
	if err != nil {
		log.Fatalln(err)
	}
	err = os.MkdirAll(output, 0777)
	if err != nil {
		log.Fatalln(err)
	}
	for _, c := range v.Cores {
		var err error
		switch c.Type {
		case "box":
			err = downloadBox(c)
		case "cat":
			err = downloadCat(c)
		default:
			err = fmt.Errorf("unknown type: %s", c.Type)
		}
		if err != nil {
			log.Fatalln(err)
		}
	}
}

func downloadBox(c Core) error {
	target := runtime.GOOS + "-" + runtime.GOARCH

	distUrl := fmt.Sprintf("https://github.com/SagerNet/sing-box/releases/download/v%s/sing-box-%s-%s.tar.gz", c.Version, c.Version, target)

	resp, err := http.Get(distUrl)
	if err != nil {
		return fmt.Errorf("download %s: %w", distUrl, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("bad status code %s: %d", distUrl, resp.StatusCode)
	}

	gzipReader, err := gzip.NewReader(resp.Body)
	if err != nil {
		return fmt.Errorf("gzip: %w", err)
	}
	defer gzipReader.Close()
	tarReader := tar.NewReader(gzipReader)
	for hdr, err := tarReader.Next(); err != io.EOF; hdr, err = tarReader.Next() {
		if err != nil {
			return fmt.Errorf("untar: %w", err)
		}
		if hdr == nil {
			continue
		}
		baseName := filepath.Base(hdr.Name)
		if baseName != c.BinaryName {
			// skip
			continue
		}
		destination := filepath.Join(output, baseName)
		switch hdr.Typeflag {
		case tar.TypeDir:
			// skip
		case tar.TypeReg:
			file, err := os.OpenFile(destination, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, os.FileMode(hdr.Mode))
			if err != nil {
				return err
			}
			_, err = io.Copy(file, tarReader)
			if err != nil {
				return err
			}
			file.Close()
		}
	}
	return nil
}

func downloadCat(c Core) error {
	target := runtime.GOOS + "-" + runtime.GOARCH
	distUrl := fmt.Sprintf("https://github.com/MetaCubeX/mihomo/releases/download/v%s/mihomo-%s-v%s.gz", c.Version, target, c.Version)

	resp, err := http.Get(distUrl)
	if err != nil {
		return fmt.Errorf("download %s: %w", distUrl, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("bad status code %s: %d", distUrl, resp.StatusCode)
	}
	gzipReadr, err := gzip.NewReader(resp.Body)
	if err != nil {
		return fmt.Errorf("gzip: %w", err)
	}
	destination := filepath.Join(output, c.BinaryName)
	file, err := os.OpenFile(destination, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0777)
	if err != nil {
		return err
	}
	_, err = io.Copy(file, gzipReadr)
	if err != nil {
		return err
	}
	return file.Close()
}
