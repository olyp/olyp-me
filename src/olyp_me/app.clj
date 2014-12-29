(ns olyp-me.app
  (:require [com.stuartsierra.component :as component]
            [olyp-me.components.web :as web]))

(defn create-system [{:keys [database web env]}]
  (component/system-map
   :env env
   :web (component/using
         (web/create-web web)
         [:env])))
