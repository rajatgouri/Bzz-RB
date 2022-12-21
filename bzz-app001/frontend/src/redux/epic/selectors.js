import { createSelector } from "reselect";

const selectepic = (state) => state.epic;

export const selectCurrentepic = createSelector(
  [selectepic],
  (epic) => {
    return epic.current
  }
);

export const selectEpicsList = createSelector(
  [selectepic],
  
  (epic) => {
    return epic.list
  }
);

export const selectItemById = (itemId) =>
  createSelector(selectListItems, (list) =>
    list.result.items.find((item) => item._id === itemId)
  );

export const selectCreatedItem = createSelector(
  [selectepic],
  (epic) => epic.create
);

export const selectUpdatedItem = createSelector(
  [selectepic],
  (epic) => epic.update
);

export const selectReadItem = createSelector([selectepic], (epic) => epic.read);

export const selectDeletedItem = createSelector(
  [selectepic],
  (epic) => epic.delete
);

export const selectSearchedItems = createSelector(
  [selectepic],
  (epic) => epic.search
);
