(ns olyp-me.components.olyp-central-api-client-ctx
  (:require [com.stuartsierra.component :as component])
  (:import [org.httpkit.client HttpClient]))

(defrecord OlypCentralApiClientCtx [url]
  component/Lifecycle

  (start [component]
    (assoc component
      :url url
      :httpkit-client (HttpClient.)))
  (stop [component]
    (.stop (:httpkit-client component))
    (dissoc component :url :httpkit-client)))

(defn create-ctx [{:keys [url]}]
  (OlypCentralApiClientCtx. url))
