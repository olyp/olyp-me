(ns olyp-me.web-handlers.profile-handler
  (:require [olyp-me.web-handlers.layout :refer [layout]]
            [optimus.link :as link]
            [olyp-app-utils.olyp-central-api-client :as central-api-client]))

(defn profile-page [req]
  {:status 200
   :headers {"Content-Type" "text/html"}
   :body
   (layout
    req
    [:div#profile-app]
    (map (fn [url] [:script {:src url}])
         (link/bundle-paths req ["lib.js" "profile.js"])))})

(defn log-out [req]
  {:status 302
   :headers {"Location" "/"}
   :session {:current-user nil}})

(defn current-user [req]
  {:status 200
   :headers {"Content-Type" "application/json"}
   :body (cheshire.core/generate-string (:current-user req))})

(defn change-password [{{:keys [api-ctx]} :olyp-env :keys [current-user body]}]
  (let [body (cheshire.core/parse-string (slurp body))]
    (if (= (body "newPassword") (body "newPasswordConfirmation"))
      (central-api-client/handle-res
       (central-api-client/request api-ctx :post "/authenticate" {:email (current-user "email") :password (body "oldPassword")}) auth-res
       201 (central-api-client/handle-res
            (central-api-client/request api-ctx :put (str "/users/" (current-user "id") "/password") {:password (body "newPassword")}) change-res
            201 {:status 200})
       422 {:status 422 :headers {"Content-Type" "application/json"} :body (cheshire.core/generate-string (:body auth-res))})
      {:status 422 :headers {"Content-Type" "application/json"} :body (cheshire.core/generate-string {:msg "Passwords doesn't match"})})))
