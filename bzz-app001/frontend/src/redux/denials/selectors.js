import { createSelector } from "reselect";

const selectdenials = (state) => state.denials;

export const selectCurrentdenials = createSelector(
  [selectdenials],
  (denials) => {
    return denials.current
  }
);

export const selectDenialsList = createSelector(
  [selectdenials],
  
  (denials) => {
    return denials.list
  }
);

export const selectItemById = (itemId) =>
  createSelector(selectListItems, (list) =>
    list.result.items.find((item) => item._id === itemId)
  );

export const selectCreatedItem = createSelector(
  [selectdenials],
  (denials) => denials.create
);

export const selectUpdatedItem = createSelector(
  [selectdenials],
  (denials) => denials.update
);

export const selectReadItem = createSelector([selectdenials], (denials) => denials.read);

export const selectDeletedItem = createSelector(
  [selectdenials],
  (denials) => denials.delete
);

export const selectSearchedItems = createSelector(
  [selectdenials],
  (denials) => denials.search
);
