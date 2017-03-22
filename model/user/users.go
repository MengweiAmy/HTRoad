package user

import (
    "fmt"
    "os"
    "encoding/json"
    "io/ioutil"
    "encoding/gob"
)
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

// Main function
// I realize this function is much too simple I am simply at a loss to
func GetUsers() UserInfo {
    file, e := ioutil.ReadFile("./user.json")
    if e != nil {
        fmt.Printf("File error: %v\n", e)
        os.Exit(1)
    }
    var userlist UserInfo
    json.Unmarshal(file, &userlist)
    return userlist;
}

func VerifyUser(username string, password string) (int) {
    gob.Register(&User{})
    userlist := GetUsers().Users;
    for i := range userlist {
        user := userlist[i]
        if username == user.Username && password == user.Password {
            return 0;
        }
    } 
    return 1;
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