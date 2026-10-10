let traversed = false;

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    traversed = true;
  });
}

export const markProjectPush = () => {
  traversed = false;
};

export const openedFromHistory = () => traversed;
