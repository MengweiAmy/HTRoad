package config

type Config struct {
    Dir string
    Port int
}

func LoadConfg() Config {
    var configFile string

    dir, err := filepath.Abs(filepath.Dir(os.Args[0]))
    if err != nil {
            log.Fatal(err)
    }
    fmt.Println("current dir without configfile:",dir)

    // Read/parse any flags/options given.
    flag.StringVar(&configFile, "config", "./starter.json", "Setup executables to start")
    flag.Parse()
    fmt.Println("configFile",configFile)

    data, err := ioutil.ReadFile(configFile)
    if err != nil {
        log.Println(err)
    }
    var configDetail Config
    json.Unmarshal(data,&configDetail);
    configDetail.Dir = dir
    return configDetail
}

func main() {
	LoadConfg();
}
