(ns olyp-me.web-handlers.invoices-handler
  (:require [olyp-me.web-handlers.layout :refer [layout]]))

(defn invoices-page [req]
  {:status 200
   :headers {"Content-Type" "text/html"}
   :body
   (layout
    req
    [:h2 "Invoices"]
    [:p "Invoice management is not yet implemented."])})
