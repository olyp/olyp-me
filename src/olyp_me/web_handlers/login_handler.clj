(ns olyp-me.web-handlers.login-handler
  (:require [hiccup.page :refer [html5]]
            [optimus.link :as link]
            [olyp-app-utils.olyp-central-api-client :as central-api-client]))

(defn login-page [req]
  {:status 200
   :headers {"Content-Type" "text/html"}
   :body
   (html5
    [:head
     [:meta {:name "viewport" :content "width=device-width, initial-scale=1"}]
     (map (fn [url] [:link {:rel "stylesheet" :href url}])
          (link/bundle-paths req ["app.css"]))]
    [:body
     [:div.container
      [:h1 "Olyp login"]
      [:form {:method "POST" :action "/login" :class "form-horizontal"}
       [:input {:type "hidden" :name "__anti-forgery-token" :value (:anti-forgery-token req)}]
       [:div.form-group
        [:label  {:for "login_username" :class "col-sm-3 control-label"} "Username (e-mail)"]
        [:div.col-sm-4
         [:input {:type "text" :name "username" :id "login_username" :class "form-control"}]]]
       [:div.form-group
        [:label  {:for "login_password" :class "col-sm-3 control-label"} "Password"]
        [:div.col-sm-4
         [:input {:type "password" :name "password" :id "login_password" :class "form-control"}]]]
       [:div.row
        [:div.col-sm-3]
        [:div.col-sm-9
         [:input {:type "submit" :value "Log in" :class "btn btn-primary"}]]]]]])})

(defn perform-login [{{username "username" password "password"} :form-params {:keys [api-ctx]} :olyp-env}]
  (central-api-client/handle-res
   (central-api-client/request api-ctx :post "/authenticate" {:email username :password password}) res
   201 {:status 302
        :headers {"Location" "/"}
        :session {:current-user (:body res)}}
   422 {:status 200
        :body (str "Login failed: " (:body res))}))
