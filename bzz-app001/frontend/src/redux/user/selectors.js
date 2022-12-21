import { createSelector } from "reselect";

const selectuser = (state) => state.user;

export const selectCurrentuser = createSelector(
  [selectuser],
  (user) => {
    return user.current
  }
);

export const selectUsersList = createSelector(
  [selectuser],
  
  (user) => {
    return user.list
  }
);

export const selectItemById = (itemId) =>
  createSelector(selectListItems, (list) =>
    list.result.items.find((item) => item._id === itemId)
  );

export const selectCreatedItem = createSelector(
  [selectuser],
  (user) => user.create
);

export const selectUpdatedItem = createSelector(
  [selectuser],
  (user) => user.update
);

export const selectReadItem = createSelector([selectuser], (user) => user.read);

export const selectDeletedItem = createSelector(
  [selectuser],
  (user) => user.delete
);

export const selectSearchedItems = createSelector(
  [selectuser],
  (user) => user.search
);
