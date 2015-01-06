(ns olyp-me.main
  (:gen-class)
  (:require olyp-me.app
            [com.stuartsierra.component :as component]))

(defn -main [& args]
  (->>
   {:olyp-central-api {:url "http://localhost:3000"}
    :web {:port 3001}
    :env :dev
    :cookie-secret "12345678abcdef12"}
   olyp-me.app/create-system
   component/start))
