(ns olyp-me.web-handlers.layout
  (:require [hiccup.page :refer [html5]]
            [optimus.link :as link]
            cheshire.core))

(defn layout [req & contents]
  (html5
   [:head
    [:meta {:charset "utf-8"}]
    [:meta {:http-equiv "X-UA-Compatible" :content "IE=edge"}]
    [:meta {:name "csrf-token" :content (:anti-forgery-token req)}]
    [:meta {:name "viewport" :content "width=device-width, initial-scale=1.0"}]
    [:title "Me - Oslo Lydproduksjon"]
    (map (fn [url] [:link {:rel "stylesheet" :href url}])
         (link/bundle-paths req ["app.css"]))]
   [:body
    [:script {:type "text/javascript"} (str "var CURRENT_USER_ID = " (cheshire.core/generate-string (get-in req [:session :current-user "id"])))]
    [:div.navbar.navbar-default
     [:div.container-fluid
      [:div.navbar-header.hidden-xs
       [:span.navbar-brand "Olyp"]]
      [:ul.nav.custom-inline-navbar-nav
       [:li [:a {:href "/booking"} "Booking"]]
       [:li [:a {:href "/invoices"} "Invoices"]]]
      [:ul.nav.custom-inline-navbar-nav.navbar-right
       [:li [:a {:href "/logout"} "Log out"]]
       [:li [:a {:href "/profile"} "My profile"]]]]]
    [:div {:class "container-fluid"} contents]]))
