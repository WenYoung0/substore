package main

import (
	"bufio"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"path"
	"strings"
)

var (
	readFrom string
	baseURL  string

	repo     string
	hashName string

	verbose bool
)

func main() {
	flag.StringVar(&readFrom, "from", "../useful.list", "")
	flag.StringVar(&baseURL, "url", "https://purge.jsdeliver.net/", "")
	flag.StringVar(&repo, "repo", "duakc/substore", "")
	flag.StringVar(&hashName, "hash", "", "")
	flag.BoolVar(&verbose, "verbose", false, "")
	flag.Parse()
	if hashName == "" {
		_, _ = fmt.Fprintln(os.Stderr, "Please specify a hash name")
	}
	if !strings.HasSuffix(baseURL, "/") {
		baseURL += "/"
	}

	if err := handle(); err != nil {
		log.Fatalln(err)
	}
}

func handle() error {
	file, err := os.Open(readFrom)
	if err != nil {
		return err
	}
	defer file.Close()
	sc := bufio.NewScanner(file)
	batchList := map[string]string{}
	for sc.Scan() {
		txt := sc.Text()
		txt = strings.TrimSpace(txt)
		if txt == "" || strings.HasPrefix(txt, "#") {
			continue
		}
		urlPath := path.Join(path.Join("gh", repo)+"@"+hashName,
			txt)

		fullUrl := baseURL + urlPath

		if verbose {
			fmt.Printf("%s: %s\n", txt, fullUrl)
		}
		batchList[txt] = fullUrl
	}
	httpClient := &http.Client{}
	for _, url := range batchList {
		if verbose {
			fmt.Printf("GET: %s\n", url)
		}
		resp, err := httpClient.Get(url)
		if err != nil {
			return err
		}
		// doesn't care about the response body
		_ = resp.Body.Close()
		if resp.StatusCode != 200 {
			return fmt.Errorf("bad status code: %d", resp.StatusCode)
		}
	}
	return nil
}
