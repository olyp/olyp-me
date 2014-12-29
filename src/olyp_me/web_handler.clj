(ns olyp-me.web-handler
  (:require cheshire.core
            [optimus.assets :as assets]
            [optimus.optimizations :as optimizations]
            [optimus.strategies :as strategies]
            [olyp-me.web-handlers.home-page-handler :as home-page-handler]))

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
