package user

import (
    "fmt"
    "os"
    "encoding/json"
    "io/ioutil"
    "encoding/gob"
    "errors"
    "runtime"
    "log"
    "path/filepath"
)

var slash = "/"

type UserInfo struct {
    Users []User
}

type User struct {
    Userid int
    Username string
    Password string
    Organization string
    Contact string
    Email string
    CoverageAreas []CoverageareasType
    RSQMaps []RsqmapsType
}

type CoverageareasType struct {
    Name   string
}

type RsqmapsType struct {
    Name     string
}

//Load the user information json file
func GetUsers() UserInfo {
    dir, err := filepath.Abs(filepath.Dir(os.Args[0]))
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println("current dir without configfile:",dir)
    if runtime.GOOS == "windows" {
        slash = "\\";
    }
    file, e := ioutil.ReadFile(dir+slash+"user.json")
    if e != nil {
        fmt.Printf("File error: %v\n", e)
        os.Exit(1)
    }
    var userlist UserInfo
    json.Unmarshal(file, &userlist)
    return userlist;
}

func VerifyUser(username string, password string) (int,error) {
    gob.Register(&User{})
    userlist := GetUsers().Users;
    for i := range userlist {
        user := userlist[i]
        if username == user.Username && password == user.Password {
            return 0,nil;
        }
    }
    err := errors.New("Wrong username or Password")
    return 1,err;
}

/*
Request current user account information by username
*/
func GetUserAccountInfoByName(username string) (User) {
    userlist := GetUsers().Users;
    for i := range userlist {
        user := userlist[i]
        if username == user.Username {
            return user;
        }
    }
    return User{Username: ""}
}