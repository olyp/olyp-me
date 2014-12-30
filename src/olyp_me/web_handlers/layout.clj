(ns olyp-me.web-handlers.layout
  (:require [hiccup.page :refer [html5]]
            [optimus.link :as link]))

(defn layout [req & contents]
  (html5
   [:head
    [:meta {:charset "utf-8"}]
    [:meta {:http-equiv "X-UA-Compatible" :content "IE=edge"}]
    [:meta {:name "csrf-token" :content (:anti-forgery-token req)}]
    [:title "Me - Oslo Lydproduksjon"]
    (map (fn [url] [:link {:rel "stylesheet" :href url}])
         (link/bundle-paths req ["app.css"]))]
   [:body
    [:div.navbar.navbar-default
     [:div.container-fluid
      [:div.navbar-header
       [:span.navbar-brand "Olyp"]]
      [:ul.nav.navbar-nav
       [:li [:a {:href "/booking"} "Booking"]]
       [:li [:a {:href "/invoices"} "Invoices"]]]
      [:ul.nav.navbar-nav.navbar-right
       [:li [:a {:href "/profile"} "My profile"]]]]]
    [:div {:class "container-fluid"} contents]]))
