import React, { lazy, Suspense } from "react";
import { Redirect, Route, Switch, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PublicRoute from "./PublicRoute";
import PageLoader from "@/components/PageLoader";

const ChangePassword = lazy(() =>
  import(/*webpackChunkName:'LoginPage'*/ "@/pages/PasswordManagement/ChangePassword")
);


const Login = lazy(() =>
  import(/*webpackChunkName:'LoginPage'*/ "@/pages/Login")
);

const NotFound = lazy(() =>
  import(/*webpackChunkName:'NotFoundPage'*/ "@/pages/NotFound")
);



const ResetPassword = lazy(() =>
  import(/*webpackChunkName:'NotFoundPage'*/ "@/pages/PasswordManagement/ResetPassword")
);



const ResetPasswordDone = lazy(() =>
  import(/*webpackChunkName:'NotFoundPage'*/ "@/pages/PasswordManagement/ResetPasswordDone")
);


const ResetChangePassword = lazy(() =>
  import(/*webpackChunkName:'NotFoundPage'*/ "@/pages/PasswordManagement/ResetChangePassword")
);

export default function AuthRouter() {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence exitBeforeEnter initial={false}>
        <Switch location={location} key={location.pathname}>

          
          <PublicRoute component={Login} path="/login" exact />
          <PublicRoute component={ResetPassword} path="/reset-password"  />
          <PublicRoute component={ResetPasswordDone} path="/reset-password-done"  />
          <PublicRoute component={ResetChangePassword} path="/password-reset"  />



          <PublicRoute
            path="/"
            component={Login}
            render={() => <Redirect to="/login" />}
          />
          <Route
            path="*"
            component={NotFound}
            render={() => <Redirect to="/notfound" />}
          />
        </Switch>
      </AnimatePresence>
    </Suspense>
  );
}
