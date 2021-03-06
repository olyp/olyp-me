(ns olyp-me.web-handler
  (:require cheshire.core
            [optimus.assets :as assets]
            [optimus.optimizations :as optimizations]
            [optimus.strategies :as strategies]
            bidi.ring
            ring.middleware.anti-forgery
            ring.middleware.session
            ring.middleware.session.cookie
            ring.middleware.params
            [olyp-me.web-handlers.login-handler :as login-handler]
            [olyp-me.web-handlers.reservation-handler :as reservation-handler]
            [olyp-me.web-handlers.invoices-handler :as invoices-handler]
            [olyp-me.web-handlers.profile-handler :as profile-handler]
            [olyp-app-utils.olyp-central-api-client :as central-api-client])
  (:import [java.util.concurrent TimeUnit]))

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
     (assets/load-bundle "public" "lib.js" ["/js/lib/react-with-addons-0.12.2.js"
                                            "/js/lib/mori-0.3.2.js"])
     (assets/load-bundle "public" "lib.js" ["/js/lib/react-with-addons-0.12.2.min.js"
                                            "/js/lib/mori-0.3.2.js"]))))

(defn get-optimizable-assets []
  (concat
   (assets/load-bundle "public" "lib.js" ["/js/lib/moment-2.8.4.js"
                                          "/js/lib/moment-timezone-with-data-0.2.5.js"
                                          "/js/lib/jquery-2.1.3.js"
                                          "/js/lib/when-3.7.2.js"
                                          "/js/lib/redux-3.0.5.js"
                                          "/js/olyp_app_utils/http.js"
                                          "/jquery-ui-1.11.4.custom/jquery-ui.js"])
   (assets/load-bundle "public" "app.css" ["/bootstrap/css/bootstrap.css"
                                           "/bootstrap/css/bootstrap-theme.css"
                                           "/jquery-ui-1.11.4.custom/jquery-ui.css"
                                           "/jquery-ui-1.11.4.custom/jquery-ui.structure.css"
                                           "/jquery-ui-1.11.4.custom/jquery-ui.structure.css"
                                           "/jquery-ui-1.11.4.custom/jquery-ui.theme.css"
                                           "/css/app.css"])
   (assets/load-bundle "public" "booking.js" ["/js/util.js"
                                              "/js/booking/booking_components.js"
                                              "/js/booking.js"])
   (assets/load-bundle "public" "profile.js" ["/js/profile/profile_components.js"
                                              "/js/profile/profile_store.js"
                                              "/js/profile/profile_actions.js"
                                              "/js/profile/profile.js"])))

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
  (fn [{{:keys [api-ctx]} :olyp-env :as req}]
    (if-let [session-user (get-in req [:session :current-user])]
      (let [user-res (central-api-client/request api-ctx :get (str "/users/" (session-user "id")))]
        (if (= 200 (:status user-res))
          (handler (assoc req :current-user (:body user-res)))
          {:status 302 :headers {"Location" "/login"} :session {:current-user nil}}))
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
               "/booking" #'reservation-handler/booking-page
               "/invoices" #'invoices-handler/invoices-page
               "/profile" #'profile-handler/profile-page
               "/logout" #'profile-handler/log-out}
         "/api" {"/bookings" {:post {"" #'reservation-handler/create-booking}}
                 "/bookings/" {[[ #"[^\/]+" :booking-id] ""] {:delete #'reservation-handler/delete-booking}}
                 "/reservable_room" {:get {"" #'reservation-handler/get-reservable-room}}
                 "/reservable_rooms/" {[[#"[^\/]+" :reservable-room-id] ""]
                                       {"/reservations/" {[[#"[^\/]+" :date] ""]
                                                          {:get {""  #'reservation-handler/reservations-for-date}}}}}
                 "/profile" {:get #'profile-handler/current-user}
                 "/password" {:put #'profile-handler/change-password}}}])
      wrap-login-required))

(defn app-handler [req]
  (some (fn [handler] (handler req)) [app-public-handler app-authenticated-handler]))

(defn create-actual-handler [olyp-central-api-client-ctx cookie-secret]
  (->
   app-handler
   (wrap-olyp-env olyp-central-api-client-ctx)
   wrap-anti-forgery-token-hack
   ring.middleware.anti-forgery/wrap-anti-forgery
   (ring.middleware.session/wrap-session
    {:store (ring.middleware.session.cookie/cookie-store
             {:key cookie-secret})
     :cookie-name "olyp-me"
     :cookie-attrs {:max-age (.convert TimeUnit/SECONDS 30 TimeUnit/DAYS)}})
   ring.middleware.params/wrap-params))

(defn create-handler [{:keys [env olyp-central-api-client-ctx cookie-secret]}]
  ((if (= :dev env)
      strategies/serve-live-assets
      strategies/serve-frozen-assets)
   (create-actual-handler olyp-central-api-client-ctx cookie-secret)
   #(get-assets env)
   optimizations/none
   {}))
