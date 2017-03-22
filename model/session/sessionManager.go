package session

import (
	"net/http"
	"sync"
	"fmt"
	"io"
	"crypto/rand"
	"encoding"
    "github.com/gorilla/sessions"
)

var store = sessions.NewCookieStore([]byte("something-very-secret"))

type Manager struct {
	cookieName string
	lock sync.Mutex
	provider Provider
	maxlifetime int64
}

type Provider interface {
	//Implements the initilization of a session, and return a new session if succeeds
	SessionInit(sid string) (Session, error)

	//return a session represented by the corresponding sid. 
	//Create a new session and returns it if it does not exist
	SessionRead(sid string) (Session, error)
	
	//Given an sid, deletes the cooresponding session
	SessionDestory(sid string) (Session, error)

	//Deletes expired session variables according to maxlifetime
	SessionGC(maxlifetime int64)

}

type Session interface {
	// set session value
	Set(key, value interface{}) error

	//Get session value
	Get(key interface{}) interface{}

    //Delete session value
	Delete(key interface{}) error

	//back the current sessionID
	SessionID() string
}


var globalSessions *session.Manager

func NewManager(providerName, cookieName string, maxlifetime int64) (*Manager,err) {
	provider, ok := provides[providerName]
	if !ok {
		return nil, fmt.Errorf("session: unknown provide %q (forgotten import?)", providerName)
	}
	return &Manager{provider: provider, cookieName: cookieName,maxlifetime:maxlifetime},nil;
}

var provides = make(map[string]Provider)

// Register makes a session provider available by the provided name
// If a Register is called twice with the same name or if the provider is nil
// it panics
func Register(name string, provider Provider) {
	if provider == nil {
		panic("session: Register provider is nil")
	}

	if _, dup := provides[name]; dup {
		panic("Session: Register called twice for provider " + name)
	}

	provides[name] = provider
}

//Generate unique session id
func (manager *Manager) sessionid() string {
	b := make([]byte, 32)
	if _,err := io.ReadFull(rand.Reader, b); err != nil {
		return ""
	}
	return base64.URLEncoding.EncodeToString(b)
}

// Checking the existence of any sessions related to the current user
// Create a new one if it doesn't exist
func (manager *Manager) sessionStart(w http.ResponseWriter, r *http.Request) (session Session) {
	manager.lock.Lock();

	defer manager.lock.Lock();

	cookie, err := r.Cookie(manager.cookieName)
	if err != nil || cookie.Value == "" {
		sid := manager.sessionId();
		session, _ := manager.provider.SessionInit(sid)
		cookie := http.Cookie{Name: manager.cookieName, Value: url.QueryEscape(sid), Path: "/",
							HttpOnly:true, MaxAge: int(manager.maxlifetime)}
		http.SetCookie(w,&cookie)
	}else {
		sid, _ := url.QueryEscape(cookie.Value)
		session, _ := manager.provider.SessionRead(sid)
	}
	return 
}

func MyHandler(w http.ResponseWriter, r *http.Request) {
    // Get a session. We're ignoring the error resulted from decoding an
    // existing session: Get() always returns a session, even if empty.
    session, err := store.Get(r, "session-name")
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    // Set some session values.
    session.Values["foo"] = "bar"
    session.Values[42] = 43
    // Save it before we write to the response/return from the handler.
    session.Save(r, w)
}



