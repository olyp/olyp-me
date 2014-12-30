(ns olyp-me.web-handlers.profile-handler
  (:require [olyp-me.web-handlers.layout :refer [layout]]))

(defn profile-page [req]
  {:status 200
   :headers {"Content-Type" "text/html"}
   :body
   (layout
    req
    [:p "Profile!"])})
