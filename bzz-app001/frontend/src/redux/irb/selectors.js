import { createSelector } from "reselect";

const selectirb = (state) => state.irb;

export const selectCurrentirb = createSelector(
  [selectirb],
  (irb) => {
    return irb.current
  }
);

export const selectIrbsList = createSelector(
  [selectirb],
  
  (irb) => {
    return irb.list
  }
);

export const selectItemById = (itemId) =>
  createSelector(selectListItems, (list) =>
    list.result.items.find((item) => item._id === itemId)
  );

export const selectCreatedItem = createSelector(
  [selectirb],
  (irb) => irb.create
);

export const selectUpdatedItem = createSelector(
  [selectirb],
  (irb) => irb.update
);

export const selectReadItem = createSelector([selectirb], (irb) => irb.read);

export const selectDeletedItem = createSelector(
  [selectirb],
  (irb) => irb.delete
);

export const selectSearchedItems = createSelector(
  [selectirb],
  (irb) => irb.search
);
