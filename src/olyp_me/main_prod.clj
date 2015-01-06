(ns olyp-me.main-prod
  (:gen-class)
  (:require olyp-me.app
            [com.stuartsierra.component :as component]
            [clojure.java.io :as io])
  (:import java.io.PushbackReader))

(defn -main [& args]
  (with-open [r (io/reader (str (first args)))]
    (->> (read (java.io.PushbackReader. r))
         (olyp-me.app/create-system)
         (component/start))))
