(ns olyp-me.main
  (:gen-class)
  (:require olyp-me.app
            [com.stuartsierra.component :as component]))

(declare app)

(defn -main [& args]
  (->>
   {:olyp-central-api {:url "http://localhost:3000"}
    :web {:port 3001}
    :env :dev}
   olyp-me.app/create-system
   component/start
   (def app)))
