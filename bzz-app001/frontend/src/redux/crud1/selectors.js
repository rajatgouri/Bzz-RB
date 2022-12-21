import { createSelector } from "reselect";

const selectcrud1 = (state) => state.crud1;

export const selectCurrentItem = createSelector(
  [selectcrud1],
  (crud1) => {
    return crud1.current
  }
);

export const selectListItems = createSelector(
  [selectcrud1],
  
  (crud1) => {
    return crud1.list
  }
);
export const selectItemById = (itemId) =>
  createSelector(selectListItems, (list) =>
    list.result.items.find((item) => item._id === itemId)
  );

export const selectCreatedItem = createSelector(
  [selectcrud1],
  (crud1) => crud1.create
);

export const selectUpdatedItem = createSelector(
  [selectcrud1],
  (crud1) => crud1.update
);

export const selectReadItem = createSelector([selectcrud1], (crud1) => crud1.read);

export const selectDeletedItem = createSelector(
  [selectcrud1],
  (crud1) => crud1.delete
);

export const selectSearchedItems = createSelector(
  [selectcrud1],
  (crud1) => crud1.search
);
