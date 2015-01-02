(ns olyp-me.components.web
  (:require [com.stuartsierra.component :as component]
            [org.httpkit.server]
            [clojure.tools.logging :as log]
            olyp-me.web-handler)
  (:import [java.util.concurrent TimeUnit]))

(defrecord Web [port]
  component/Lifecycle

  (start [component]
    (let [handler (olyp-me.web-handler/create-handler
                   {:env (:env component)
                    :olyp-central-api-client-ctx (-> component :olyp-central-api-client-ctx)
                    :cookie-secret (:cookie-secret component)})
          server (org.httpkit.server/run-server handler {:port port})]
      (log/info (str "Started web server on port " port))
      (assoc component
        :server server)))
  (stop [component]
    ((:server component) :timeout (.convert TimeUnit/MILLISECONDS 1 TimeUnit/SECONDS))
    (dissoc component :server)))

(defn create-web [{:keys [port]}]
  (Web. port))
