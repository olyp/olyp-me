(ns olyp-me.web-handlers.reservation-handler
  (:require [olyp-me.web-handlers.layout :refer [layout]]
            [optimus.link :as link]
            [olyp-app-utils.olyp-central-api-client :as central-api-client]))

(defn booking-page [req]
  {:status 200
   :headers {"Content-Type" "text/html"}
   :body
   (layout
    req
    [:div#booking-app]
    (map (fn [url] [:script {:src url}])
         (link/bundle-paths req ["lib.js" "booking.js"])))})

(defn create-booking [{{:keys [api-ctx]} :olyp-env :keys [body] {:keys [current-user]} :session}]
  (central-api-client/handle-res
   (central-api-client/request api-ctx :post (str "/users/" (current-user "id") "/bookings") body) res
   201 {:status 200
        :headers {"Content-Type" "application/json"}
        :body "{}"}
   422 {:status 422
        :headers {"Content-Type" "application/json"}
        :body (cheshire.core/generate-string (:body res))}))

(defn get-reservable-room [{{:keys [api-ctx]} :olyp-env}]
  (central-api-client/handle-res
   (central-api-client/request api-ctx :get "/reservable_rooms") res
   200 (do
         (let [body (:body res)]
           (if (= (count body) 1)
             {:status 200
              :headers {"Content-Type" "application/json"}
              :body (cheshire.core/generate-string (first body))}
             {:status 500})))))

(defn reservations-for-date [{{:keys [api-ctx]} :olyp-env :keys [route-params]}]
  (central-api-client/handle-res
   (central-api-client/request api-ctx :get (str "/reservable_rooms/" (:reservable-room-id route-params) "/reservations/" (:date route-params))) res
   200 {:status 200
        :headers {"Content-Type" "application/json"}
        :body (cheshire.core/generate-string (:body res))}))

(defn delete-booking [{{:keys [api-ctx]} :olyp-env :keys [route-params session]}]
  (let [booking-id (:booking-id route-params)
        user-id (get-in session [:current-user "id"])]
    (prn (central-api-client/request api-ctx :delete (str "/users/" user-id "/bookings/" booking-id)))
    {:status 200
     :headers {"Content-Type" "application/json"}
     :body "{}"}))
