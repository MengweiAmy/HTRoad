package main

import (
	"net/http"
	"fmt"
	"html/template"
	"log"
	"time"
	"io"
    "github.com/gorilla/sessions"
    "encoding/json"
    "runtime"

	users "HTRoad/model/user"
    config "HTRoad/model/config"
    // sessions "./model/session"
)

///Users/sunmengwei/Documents/go/src

const STATIC_URL string = "/static/"
const STATIC_ROOT string="static/"

var globalConfig = config.LoadConfg()
var slash string

var store = sessions.NewCookieStore([]byte("something-very-secret"))

type Context struct {
	Title string
	Static string
}

func HomePage(w http.ResponseWriter, req *http.Request) {
	context := Context{Title: "HOTS"}
	render(w,globalConfig.Dir+slash+"templates"+slash+"index.html",context)
}

func RoadSurface(w http.ResponseWriter, req *http.Request) {
	context := Context{Title: "RoadQuality"}
	render(w,globalConfig.Dir+slash+"templates"+slash+"roadSurface.html", context)
}

func Login(w http.ResponseWriter, r *http.Request) {
    if r.Method == "GET" {
        t, _ := template.ParseFiles(globalConfig.Dir+slash+"index.html")
        t.Execute(w, nil)
    } else {
        r.ParseForm()
        // logic part of log in
        fmt.Println("username:", r.Form["username"])
        fmt.Println("password:", r.Form["password"])
        userNa := r.Form["username"][0]
        //pass := r.Form["password"][0]
        fmt.Println("userNa:", userNa)

        //sess := sessions.SessionStart(w,r)
        result,err := users.VerifyUser(r.Form["username"][0],r.Form["password"][0])
        fmt.Println("err mes:",err)
        	if result == 0 {
        		// cookie = &http.Cookie {
        		// 	Name: "demo",
        		// 	Value: "demo",
        		// }

        		fmt.Println("login successfully and trying to Redirect to road page")
        		//fmt.Println("cookie",cookie)
                // Get a session. We're ignoring the error resulted from decoding an
                // existing session: Get() always returns a session, even if empty.
                session, _ := store.Get(r, "get_name_session")
                // Set some session values.
                session.Values["name"] = userNa
                session.Values[42] = 43
                session.Options = &sessions.Options{
                    MaxAge:   60*5,//set max age 5mins
                    HttpOnly: true,
                }
                // Save it before we write to the response/return from the handler.
                session.Save(r, w)
                name,ok := session.Values["name"].(string)
                if ok {
                    fmt.Println("session",name);
                }
                //sess.Set("username", r.Form["username"])
        		http.Redirect(w,r,"roadquality",http.StatusSeeOther)
        	}else {
        		fmt.Println("login failed")
        		http.Error(w, "authorization failed, Wrong UserName or Password", http.StatusUnauthorized)
       		}
    }
}

func render(w http.ResponseWriter,tmpl string, context Context) {
	context.Static = STATIC_URL
	tmpl_list := []string{globalConfig.Dir+slash+"templates"+slash+"base.html", fmt.Sprintf("%s",tmpl)}
	t,err := template.ParseFiles(tmpl_list...)
	if err != nil {
		log.Print("template parsing error:",err)
	}
	err = t.Execute(w,context)
	if err != nil {
		log.Print("template executing error:",err)
	}
}

func AccountInfo(w http.ResponseWriter, r *http.Request) {
    session, _ := store.Get(r, "get_name_session")
    name,ok := session.Values["name"].(string)
    if ok {
        fmt.Println("get current user",name);
    }

    person := users.GetUserAccountInfoByName(name)
    //if person, ok := val.(*users.UserInfo); !ok {
        // Handle the case that it's not an expected type
    //}
    s,_ := json.Marshal(person)
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(person)
   // w.Write(s)
    fmt.Printf("get current user", s);
}

func StaticHandler(w http.ResponseWriter, req *http.Request) {
	static_file := req.URL.Path[len(STATIC_URL):]
   // fmt.Printf("static_file", static_file)
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
    //globalConfig:=LoadConfg();
    if runtime.GOOS == "windows" {
        slash = "\\";
    }
    fmt.Println("Hello from Main")

	fmt.Printf("Results: %v\n", users.GetUsers())
	http.HandleFunc("/",HomePage)
	http.HandleFunc("/login", Login)
	http.HandleFunc("/roadquality/", RoadSurface)
    http.HandleFunc("/account/", AccountInfo)
	http.HandleFunc(STATIC_URL,StaticHandler)
	err := http.ListenAndServe(":"+globalConfig.Port,nil)
	if err != nil {
		log.Fatal("ListenAndServe:",err)
	}
}