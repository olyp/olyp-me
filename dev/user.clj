(ns user
  (:require [com.stuartsierra.component :as component]
            [clojure.tools.namespace.repl :refer (refresh)]
            [olyp-me.app :as app]))

(def system nil)

(defn init []
  (alter-var-root #'system
    (constantly (app/create-system {:olyp-central-api {:url "http://localhost:3000"}
                                    :web {:port 3001}
                                    :env :dev}))))

(defn start []
  (alter-var-root #'system component/start))

(defn stop []
  (alter-var-root #'system
    (fn [s] (when s (component/stop s)))))

(defn go []
  (init)
  (start))

(defn reset []
  (stop)
  (refresh :after 'user/go))
