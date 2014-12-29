(ns olyp-me.web-handler
  (:require cheshire.core
            [hiccup.page :refer [html5]]
            [optimus.assets :as assets]
            [optimus.optimizations :as optimizations]
            [optimus.strategies :as strategies]
            [optimus.link :as link]))

(defn render-home-page [req]
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
     [:div#app]
     (map (fn [url] [:script {:src url}])
          (link/bundle-paths req ["lib.js" "app.js"]))])})

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
   (assets/load-bundle "public" "lib.js" [])
   (assets/load-bundle "public" "app.css" ["/bootstrap/css/bootstrap.css"
                                           "/bootstrap/css/bootstrap-theme.css"
                                           "/css/app.css"])
   (assets/load-bundle "public" "app.js" ["/js/app.js"])))

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

(defn create-handler [{:keys [env]}]
  ((if (= :dev env)
      strategies/serve-live-assets
      strategies/serve-frozen-assets)
   (fn [req]
     (if (and (= "/" (:uri req)) (= :get (:request-method req)))
       (render-home-page req)))
   #(get-assets env)
   optimizations/none
   {}))
