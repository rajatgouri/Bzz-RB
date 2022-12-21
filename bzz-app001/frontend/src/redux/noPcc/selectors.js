import { createSelector } from "reselect";

const selectnoPcc = (state) => state.noPcc;

export const selectCurrentnoPcc = createSelector(
  [selectnoPcc],
  (noPcc) => {
    return noPcc.current
  }
);

export const selectnoPccsList = createSelector(
  [selectnoPcc],
  
  (noPcc) => {
    return noPcc.list
  }
);

export const selectItemById = (itemId) =>
  createSelector(selectListItems, (list) =>
    list.result.items.find((item) => item._id === itemId)
  );

export const selectCreatedItem = createSelector(
  [selectnoPcc],
  (noPcc) => noPcc.create
);

export const selectUpdatedItem = createSelector(
  [selectnoPcc],
  (noPcc) => noPcc.update
);

export const selectReadItem = createSelector([selectnoPcc], (noPcc) => noPcc.read);

export const selectDeletedItem = createSelector(
  [selectnoPcc],
  (noPcc) => noPcc.delete
);

export const selectSearchedItems = createSelector(
  [selectnoPcc],
  (noPcc) => noPcc.search
);
