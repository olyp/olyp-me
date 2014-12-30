(ns olyp-me.olyp-central-api-client
  (:require [org.httpkit.client :as http]
            cheshire.core))

(defn get-body [res]
  (if (.startsWith (get-in res [:headers :content-type] "") "application/json")
    (cheshire.core/parse-string (:body res))
    (:body res)))

(defmacro handle-res [perform-res res-binding & handlers]
  (if (odd? (count handlers))
    (throw (IllegalArgumentException. "Expected an even number of clauses")))
  `(let [~res-binding ~perform-res
         status# (:status ~res-binding)]
     (case status#
       ~@handlers
       {:status 501 :body (str "501 Not Implemented (" status# ")")})))

(defn request
  ([ctx method path])
  ([ctx method path body]
     (let [res
           @(http/request
             {:method method
              :body (cheshire.core/generate-string body)
              :url (str (:url ctx) path)
              :client (:httpkit-client ctx)})]
       {:status (:status res)
        :headers (:headers res)
        :body (get-body res)
        :httpkit-res res})))
