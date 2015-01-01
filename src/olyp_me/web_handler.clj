(ns olyp-me.web-handler
  (:require cheshire.core
            [optimus.assets :as assets]
            [optimus.optimizations :as optimizations]
            [optimus.strategies :as strategies]
            bidi.ring
            ring.middleware.anti-forgery
            ring.middleware.session
            ring.middleware.params
            [olyp-me.web-handlers.login-handler :as login-handler]
            [olyp-me.web-handlers.booking-handler :as booking-handler]
            [olyp-me.web-handlers.invoices-handler :as invoices-handler]
            [olyp-me.web-handlers.profile-handler :as profile-handler]))

(defn first-step-optimizations [assets options]
  (-> assets
      (optimizations/minify-js-assets options)
      (optimizations/minify-css-assets options)
      (optimizations/inline-css-imports)))

(defn second-step-optimizations [assets options]
  (-> assets
      (optimizations/concatenate-bundles)
      (optimizations/add-cache-busted-expires-headers)
      (optimizations/add-last-modified-headers)))

(defn get-unoptimizable-assets [env]
  (concat
   (if (= :dev env)
     (assets/load-bundle "public" "lib.js" ["/js/lib/react-with-addons-0.12.2.js"])
     (assets/load-bundle "public" "lib.js" ["/js/lib/react-with-addons-0.12.2.min.js"]))))

(defn get-optimizable-assets []
  (concat
   (assets/load-bundle "public" "lib.js" ["/js/lib/moment-2.8.4.js"
                                          "/js/lib/moment-timezone-with-data-0.2.5.js"
                                          "/js/lib/jquery-2.1.3.js"
                                          "/js/lib/when-3.6.4.js"
                                          "/bootstrap-datepicker/js/bootstrap-datepicker.js"])
   (assets/load-bundle "public" "app.css" ["/bootstrap/css/bootstrap.css"
                                           "/bootstrap/css/bootstrap-theme.css"
                                           "/bootstrap-datepicker/css/datepicker.css"
                                           "/css/app.css"])
   (assets/load-bundle "public" "booking.js" ["/js/booking/booking_components.js"
                                              "/js/booking/booking_store.js"
                                              "/js/booking/booking_actions.js"
                                              "/js/booking.js"])))

(defn get-assets [env]
  (if (= :dev env)
    (concat
     (get-unoptimizable-assets env)
     (get-optimizable-assets))
    (-> (concat
         (get-unoptimizable-assets env)
         (-> (get-optimizable-assets)
             (first-step-optimizations {})))
        (second-step-optimizations {}))))

(defn wrap-login-required [handler]
  (fn [req]
    (if (get-in req [:session :current-user])
      (handler req)
      {:status 302 :headers {"Location" "/login"}})))

(defn wrap-anti-forgery-token-hack [handler]
  (fn [req]
    (handler (assoc req :anti-forgery-token ring.middleware.anti-forgery/*anti-forgery-token*))))

(defn wrap-olyp-env [handler olyp-central-api-client-ctx]
  (fn [req]
    (handler (assoc req
               :olyp-env {:api-ctx olyp-central-api-client-ctx}))))

(def app-public-handler
  (bidi.ring/make-handler
   [""
    {:get {"/login" #'login-handler/login-page}
     :post {"/login" #'login-handler/perform-login}}]))

(def app-authenticated-handler
  (-> (bidi.ring/make-handler
       [""
        {:get {"/" (fn [req] {:status 302 :headers {"Location" "/booking"}})
               "/booking" #'booking-handler/booking-page
               "/invoices" #'invoices-handler/invoices-page
               "/profile" #'profile-handler/profile-page}
         "/api" {"/bookings" {:post {"" #'booking-handler/create-booking}}
                 "/bookable_room" {:get {"" #'booking-handler/get-bookable-room}}
                 "/bookable_rooms/" {[[#"[^\/]+" :bookable-room-id] ""]
                                     {"/bookings/" {[[#"[^\/]+" :date] ""]
                                                    {:get {""  #'booking-handler/bookings-for-date}}}}}}}])
      wrap-login-required))

(defn app-handler [req]
  (some (fn [handler] (handler req)) [app-public-handler app-authenticated-handler]))

(defn create-actual-handler [olyp-central-api-client-ctx]
  (->
   app-handler
   (wrap-olyp-env olyp-central-api-client-ctx)
   wrap-anti-forgery-token-hack
   ring.middleware.anti-forgery/wrap-anti-forgery
   ring.middleware.session/wrap-session
   ring.middleware.params/wrap-params))

(defn create-handler [{:keys [env olyp-central-api-client-ctx]}]
  ((if (= :dev env)
      strategies/serve-live-assets
      strategies/serve-frozen-assets)
   (create-actual-handler olyp-central-api-client-ctx)
   #(get-assets env)
   optimizations/none
   {}))
