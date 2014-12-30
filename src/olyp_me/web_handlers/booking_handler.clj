(ns olyp-me.web-handlers.booking-handler
  (:require [olyp-me.web-handlers.layout :refer [layout]]
            [optimus.link :as link]))

(defn booking-page [req]
  {:status 200
   :headers {"Content-Type" "text/html"}
   :body
   (layout
    req
    [:div#booking-app]
    (map (fn [url] [:script {:src url}])
         (link/bundle-paths req ["lib.js" "booking.js"])))})
