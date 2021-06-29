package main

import (
	"net/http"
	"sync"
	"log"
	"strconv"
	"fmt"
	"time"
	"regexp"
	"encoding/json"
	"io/ioutil"
	"strings"
	"sort"
	"path"
	"os"

  	"github.com/PuerkitoBio/goquery"
)

type Mod struct {
	Title string
	picURL string
	PicBase string
	// Authors string
	ReleaseDate string
	Views int
	Rating float64
	Reviews int
	Description string
	Video bool
	Guide bool
	Screens bool
	Review bool
	Tags []string
	Platform string
	Url string
}

type Result struct {
	Scraped int64
	Data []Mod
}

func main() {
	// 1. Узнаем количество страниц в каталоге.
	root := getDocument("https://ap-pro.ru/stuff/")
	pagesNum, _ := strconv.Atoi(root.Find(".ipsPagination_last a").AttrOr("data-page", ""))
	// 2. Генерируем ссылки на страницы каталога.
	catalogUrls := make([]string, pagesNum)
	for i := range catalogUrls {
		catalogUrls[i] = fmt.Sprint("https://ap-pro.ru/stuff/page/", i + 1)
	}
	// 3. Получаем содержимое страниц каталога.
	fmt.Println("Получение содержимого страниц каталога...")
	catalogContent := getDocuments(catalogUrls)
	// 4. Извлекаем ссылки на страницы модов со страниц каталога.
	fmt.Println("Извлечение ссылок на страницы модов со страниц каталога...")
	var modUrls []string
	for _, doc := range catalogContent {
		doc.Find("header h2 a[title^=\"Подробнее о\"]").Each(func(i int, s *goquery.Selection) {
			modUrls = append(modUrls, s.AttrOr("href", ""))
		})
	}
	fmt.Println("Найдено модов:", len(modUrls))
	// 5. Получаем содержимое страниц модов.
	fmt.Println("Получение содержимого страниц модов...")
	scraped := time.Now()
	modsContent := getDocuments(modUrls)
	fmt.Println("Заняло времени:", time.Since(scraped))
	// 6. Извлекаем инфу со страниц модов.
	fmt.Println("Извлечение инфы со страниц модов...")
	parsingStarted := time.Now()
	data := make([]Mod, len(modsContent))
	var wg sync.WaitGroup
	for i, doc := range modsContent {
		wg.Add(1)
		go func(i int, doc *goquery.Document) {
			defer wg.Done()
			var mod Mod
			mod.Title = doc.Find(".ipsPageHeader .ipsType_pageTitle span").Text()

			picStyle, _ := doc.Find(".modInfoGrid .cCmsRecord_image").Attr("style")
			picURL := strings.Split(picStyle, "url(")[1]
			mod.picURL = strings.Split(picURL, ")")[0]

			mod.PicBase = path.Base(mod.picURL)

			// mod.Authors = strings.TrimSpace(doc.Find(".modInfoGrid .fa-user").Parent().Text())
			mod.ReleaseDate = strings.TrimSpace(doc.Find(".modInfoGrid .fa-clock-o").Parent().Text())

			modInfoGridText := doc.Find(".modInfoGrid").Text()

			re := regexp.MustCompile(`(\d+) \| Позиция в рейтинге`)
			views, _ := strconv.Atoi(re.FindStringSubmatch(modInfoGridText)[1])
			mod.Views = views

			re = regexp.MustCompile(`(\d{1,2}(?:,\d)?)[^\d]+(\d+) отзыв`)
			matches := re.FindStringSubmatch(modInfoGridText)
			rating, _ := strconv.ParseFloat(strings.ReplaceAll(matches[1], ",", "."), 64)
			reviews, _ := strconv.Atoi(matches[2])
			mod.Rating = rating
			mod.Reviews = reviews

			mod.Description = strings.TrimSpace(doc.Find("article section p").Text())

			addButtonsText := doc.Find("article .additionalButtons").Text()
			mod.Video = strings.Contains(addButtonsText, "Видео")
			mod.Guide = strings.Contains(addButtonsText, "Прохожден")
			mod.Screens = strings.Contains(addButtonsText, "Скрин")
			mod.Review = strings.Contains(addButtonsText, "Обзор")

			mod.Platform = strings.TrimSpace(doc.Find(".modInfoGrid .fa-folder-open-o").Parent().Text())

			doc.Find(".ipsTags.ipsList_inline li span").Each(func(i int, s *goquery.Selection) {
				mod.Tags = append(mod.Tags, s.Text())
			})

			mod.Url = modUrls[i]

			data[i] = mod
		}(i, doc)
	}
	wg.Wait()
	fmt.Println("Заняло времени:", time.Since(parsingStarted))
	// 7. Записываем результат на диск.
	file, _ := json.MarshalIndent(Result{scraped.Unix(), data}, "", "    ")
	// Приложение использует этот файл.
	writeFile("../data.json", file)
	// Для истории.
	n := fmt.Sprintf("../../Data-%d-%02d-%02d-%02d-%02d-%02d.json", scraped.Year(), scraped.Month(), scraped.Day(), scraped.Hour(), scraped.Minute(), scraped.Second())
	writeFile(n, file)
	
	fmt.Println("Всё. Результат в файле", n)

	// 8. Выполняем дополнительные действия.

	tagsSet := make(map[string]bool)
	platformSet := make(map[string]bool)
	for _, mod := range data {
		platformSet[mod.Platform] = true
		for _, tag := range mod.Tags {
			tagsSet[tag] = true
		}
	}
	var tagsArr []string
	for k := range tagsSet {
		tagsArr = append(tagsArr, k)
	}
	sort.Strings(tagsArr)

	var platformArr []string
	for k := range platformSet {
		platformArr = append(platformArr, k)
	}
	file, _ = json.MarshalIndent(tagsArr, "", "    ")
	writeFile("../tags.json", file)
	file, _ = json.MarshalIndent(platformArr, "", "    ")
	writeFile("../platforms.json", file)

	fmt.Println("Скачивание превьюшек...")
	lalka := time.Now()
	thumbDir := "../public/previews/"
	archiveDir := "../Picture archive/"
	err := os.RemoveAll(thumbDir) // https://golang.org/pkg/os/#RemoveAll
	check(err)
	for i, mod := range data {
		wg.Add(1)
		go func(i int, url string) {
			defer wg.Done()
			base := path.Base(url)
			pic, err := ioutil.ReadFile(archiveDir + base)
			if err != nil {
				// TO-DO: оно работает, но может быть не так шустро, как хотелось бы...
				time.Sleep(time.Duration(i) * 100 * time.Millisecond)
				pic = getPic(url)
				writeFile(archiveDir + base, pic)
			}
			writeFile(thumbDir + base, pic)
		}(i, mod.picURL)
	}
	wg.Wait()
	fmt.Println("Заняло времени:", time.Since(lalka))
}

func getDocuments(urls []string) []*goquery.Document {
	// https://stackoverflow.com/questions/49879322/can-i-concurrently-write-different-slice-elements
	// https://www.reddit.com/r/golang/comments/jxr0o3/are_fixedlength_arrays_threadsafe_if_goroutines/
	docs := make([]*goquery.Document, len(urls))
	var wg sync.WaitGroup
	for i, url := range urls {
		wg.Add(1)
		go func(i int, url string) {
			defer wg.Done()
			time.Sleep(time.Duration(i) * 100 * time.Millisecond)
			docs[i] = getDocument(url)
		}(i, url)
	}
	wg.Wait()
	return docs
}

func getDocument(url string) *goquery.Document {
	res, err := http.Get(url)
	check(err)
	if res.StatusCode != 200 {
		log.Fatalln("status code error:", url, res.Status)
	}
	defer res.Body.Close()
	doc, err := goquery.NewDocumentFromReader(res.Body)
	check(err)
	return doc
}

func getPic(url string) []byte {
	res, err := http.Get(url)
	check(err)
	if res.StatusCode != 200 {
		log.Fatalln("status code error:", url, res.Status)
	}
	defer res.Body.Close()
	content, err := ioutil.ReadAll(res.Body)
	check(err)
	return content
}

func check(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

func writeFile(filename string, data []byte) {
	os.MkdirAll(path.Dir(filename), 0644)
	err := ioutil.WriteFile(filename, data, 0644)
	check(err)
}