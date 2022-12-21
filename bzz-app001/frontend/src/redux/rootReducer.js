import { combineReducers } from "redux";

import { reducer as authReducer } from "./auth";
import { reducer as crudReducer } from "./crud";
import { reducer as crud1Reducer } from "./crud1";

import { reducer as searchReducer } from "./search";
import { reducer as userReducer } from "./user";
import { reducer as denialsReducer } from "./denials";

import { reducer as noPccReducer } from "./noPcc";
import { reducer as epicReducer } from "./epic";
import { reducer as irbReducer } from "./irb";
import { reducer as irbBudgetReducer } from "./irbBudget";






import * as actionTypes from "./auth/types";

// Combine all reducers.

const appReducer = combineReducers({
  auth: authReducer,
  crud: crudReducer,
  crud1: crud1Reducer,

  user: userReducer,
  noPcc: noPccReducer,
  search: searchReducer,
  epic: epicReducer,
  irb: irbReducer,
  irbBudget: irbBudgetReducer,
  denials: denialsReducer
});

const rootReducer = (state, action) => {
  if (action.type === actionTypes.LOGOUT_SUCCESS) {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
