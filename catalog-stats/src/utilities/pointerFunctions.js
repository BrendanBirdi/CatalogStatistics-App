
const updatePointerEvents = (mouseMoveEvent) => {
  if (!document.getElementById('image-viewer')) {
    return;
  }
  // elements we'll be using
  const viewer = document.getElementById('image-viewer');

  // radius / centerpoint of viewer
  const viewerRadius = Math.round(viewer.offsetWidth / 2);
  const viewerCenterX = Math.round(viewer.getBoundingClientRect().left) + viewerRadius;
  const viewerCenterY = Math.round(viewer.getBoundingClientRect().top) + viewerRadius;

  // distances of mouse position from center of each element
  const distanceFromViewerCenter = Math.sqrt((viewerCenterX - mouseMoveEvent.clientX) * (viewerCenterX - mouseMoveEvent.clientX) + (viewerCenterY - mouseMoveEvent.clientY) * (viewerCenterY - mouseMoveEvent.clientY));

  if (distanceFromViewerCenter <= viewerRadius) {
    // mouse is over the viewer
    viewer.style.pointerEvents = 'auto';
  } else {
    // mouse is not over any viewer element
    viewer.style.pointerEvents = 'none';
  }
};

export {
  updatePointerEvents,
};
