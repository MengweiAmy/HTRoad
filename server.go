package main

import (
	"net/http"
	"fmt"
	"html/template"
	"log"
	"time"
	"io"

	users "./model/user"
)

const STATIC_URL string = "/static/"
const STATIC_ROOT string="static/"

type Context struct {
	Title string
	Static string
}

func HomePage(w http.ResponseWriter, req *http.Request) {
	context := Context{Title: "HOTS"}
	render(w,"index.html",context)
}

func RoadSurface(w http.ResponseWriter, req *http.Request) {
	context := Context{Title: "RoadQuality"}
	render(w,"roadSurface.html", context)
}

func login(w http.ResponseWriter, r *http.Request) {
    fmt.Println("method:", r.Method) //get request method
    fmt.Println("path", r.URL.Path)
    fmt.Println("url", r.URL)
    if r.Method == "GET" {
        t, _ := template.ParseFiles("index.html")
        t.Execute(w, nil)
    } else {
        r.ParseForm()
        // logic part of log in
        fmt.Println("username:", r.Form["username"])
        fmt.Println("password:", r.Form["password"])
        result := users.VerifyUser(r.Form["username"][0],r.Form["password"][0])
        if result == 0 {
        	fmt.Println("login successfully and trying to Redirect to road page")
        	fmt.Println("httostatus",r)
        	http.Redirect(w,r,"roadquality",http.StatusSeeOther)
        	return
        }else {
        	fmt.Println("login failed")
        	http.Redirect(w,r,"",http.StatusSeeOther)
        }

    }
}

func render(w http.ResponseWriter,tmpl string, context Context) {
	context.Static = STATIC_URL
	tmpl_list := []string{"templates/base.html", fmt.Sprintf("templates/%s",tmpl)}
	t,err := template.ParseFiles(tmpl_list...)
	if err != nil {
		log.Print("template parsing error:",err)
	}
	err = t.Execute(w,context)
	if err != nil {
		log.Print("template executing error:",err)
	}
}

func StaticHandler(w http.ResponseWriter, req *http.Request) {
	static_file := req.URL.Path[len(STATIC_URL):]
	if len(static_file) != 0 {
		f, err := http.Dir(STATIC_ROOT).Open(static_file)
		if err == nil {
			content := io.ReadSeeker(f)
			http.ServeContent(w,req,static_file,time.Now(), content)
			return
		}
	}
	http.NotFound(w,req)
}

func main() {
	//fs := justFilesFilesystem{http.Dir("http/resources/")}
	fmt.Printf("Results: %v\n", users.GetUsers())
	http.HandleFunc("/",HomePage)
	http.HandleFunc("/login", login)
	http.HandleFunc("/roadquality/", RoadSurface)
	http.HandleFunc(STATIC_URL,StaticHandler)
	err := http.ListenAndServe(":9090",nil)
	if err != nil {
		log.Fatal("ListenAndServe:",err)
	}
}