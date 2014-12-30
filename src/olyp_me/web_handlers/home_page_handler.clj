(ns olyp-me.web-handlers.home-page-handler
  (:require [hiccup.page :refer [html5]]
            [optimus.link :as link]))

(defn show-home-page [req]
  {:status 200
   :headers {"Content-Type" "text/html"}
   :body
   (html5
    [:head
     [:meta {:charset "utf-8"}]
     [:meta {:http-equiv "X-UA-Compatible" :content "IE=edge"}]
     [:meta {:name "viewport" :content "width=device-width, initial-scale=1"}]
     [:title "Me - Oslo Lydproduksjon"]
     (map (fn [url] [:link {:rel "stylesheet" :href url}])
          (link/bundle-paths req ["app.css"]))]
    [:body
     [:div.navbar.navbar-default
      [:div {:id "navbar-target" :class "container-fluid"}]]
     [:div {:class "container-fluid"} "Content here..."]
     (map (fn [url] [:script {:src url}])
          (link/bundle-paths req ["lib.js" "app.js"]))])})
