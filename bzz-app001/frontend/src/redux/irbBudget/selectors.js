import { createSelector } from "reselect";

const selectirbBudget = (state) => state.irbBudget;

export const selectCurrentirbBudget = createSelector(
  [selectirbBudget],
  (irbBudget) => {
    return irbBudget.current
  }
);

export const selectirbBudgetsList = createSelector(
  [selectirbBudget],
  
  (irbBudget) => {
    return irbBudget.list
  }
);

export const selectItemById = (itemId) =>
  createSelector(selectListItems, (list) =>
    list.result.items.find((item) => item._id === itemId)
  );

export const selectCreatedItem = createSelector(
  [selectirbBudget],
  (irbBudget) => irbBudget.create
);

export const selectUpdatedItem = createSelector(
  [selectirbBudget],
  (irbBudget) => irbBudget.update
);

export const selectReadItem = createSelector([selectirbBudget], (irbBudget) => irbBudget.read);

export const selectDeletedItem = createSelector(
  [selectirbBudget],
  (irbBudget) => irbBudget.delete
);

export const selectSearchedItems = createSelector(
  [selectirbBudget],
  (irbBudget) => irbBudget.search
);
