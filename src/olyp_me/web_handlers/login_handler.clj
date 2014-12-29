(ns olyp-me.web-handlers.login-handler
  (:require [hiccup.page :refer [html5]]))

(defn login-page [req]
  {:status 200
   :headers {"Content-Type" "text/html"}
   :body
   (html5
    [:head]
    [:body
     [:h1 "Velkommen til tidenes styggeste innloggingsside!"]
     [:form {:method "POST" :action "/login"}
      [:input {:type "hidden" :name "__anti-forgery-token" :value (:anti-forgery-token req)}]
      [:p [:label "Brukernavn" [:input {:type "text" :name "username"}]]]
      [:p [:label "Passord" [:input {:type "password" :name "password"}]]]
      [:p [:input {:type "submit" :value "Logg inn"}]]]])})

(defn perform-login [{{username "username" password "password"} :form-params}]
  {:status 200 :body "Dat login"})
