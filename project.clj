(defproject olyp-me "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [optimus "0.15.0"]
                 [hiccup "1.0.5"]
                 [http-kit "2.1.16"]
                 [com.stuartsierra/component "0.2.2"]
                 [cheshire "5.3.1"]
                 [ring/ring-anti-forgery "1.0.0"]
                 [bidi "1.12.0"]
                 [org.clojure/tools.logging "0.3.1"]
                 [ch.qos.logback/logback-classic "1.1.2"]]
  :main olyp-me.main
  :profiles {:dev {:source-paths ["dev"]}}
  :plugins [[cider/cider-nrepl "0.7.0-SNAPSHOT"]])
