const SVG_NS = "http://www.w3.org/2000/svg";
const DEFAULT_PADDING = 120;
const MIN_ZOOM = 0.35;
const MAX_ZOOM = 2.2;

const state = {
  graph: null,
  source: "custom",
  customPath: "",
  selectedId: null,
  hoveredId: null,
  loading: false,
  error: null,
  filters: {
    skill: true,
    agent: true,
  },
  camera: {
    scale: 1,
    tx: 0,
    ty: 0,
    autoFit: true,
    mode: "select",
  },
  viewport: {
    width: 0,
    height: 0,
  },
  world: {
    originX: 0,
    originY: 0,
    width: 0,
    height: 0,
    baseWidth: 0,
    baseHeight: 0,
    padding: DEFAULT_PADDING,
  },
  layoutMap: new Map(),
  nodeOffsets: {},
  ui: {
    sourcesCollapsed: false,
    inspectorCollapsed: false,
    sourcesOpen: false,
    inspectorOpen: false,
    menuOpen: false,
    helpOpen: false,
  },
  interaction: null,
  dom: {
    nodes: new Map(),
    edges: new Map(),
    miniNodes: new Map(),
    miniViewport: null,
  },
  suppressedNodeClickId: null,
};

const els = {};
let renderQueued = false;
let resizeObserver = null;

function $(selector) {
  return document.querySelector(selector);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setStatus(text, variant = "") {
  els.statusChip.textContent = text;
  els.statusChip.dataset.variant = variant;
}

function setVisible(el, visible) {
  el.hidden = !visible;
}

function isDesktopLayout() {
  return !window.matchMedia("(max-width: 1100px)").matches;
}

function isMobileLayout() {
  return window.matchMedia("(max-width: 720px)").matches;
}

function currentSourceUrl() {
  if (state.source === "custom") {
    return `/api/graph?source=custom&path=${encodeURIComponent(state.customPath.trim())}`;
  }
  return `/api/graph?source=${encodeURIComponent(state.source)}`;
}

function currentShareUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("source", state.source);
  if (state.source === "custom" && state.customPath.trim()) {
    url.searchParams.set("path", state.customPath.trim());
  } else {
    url.searchParams.delete("path");
  }
  return url.toString();
}

async function fetchJson(url) {
  const response = await fetch(url);
  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(payload.message || payload.error || `Request failed: ${response.status}`);
    error.payload = payload;
    error.status = response.status;
    throw error;
  }
  return payload;
}

function renderSourceState(message, variant = "", details = []) {
  els.sourceState.classList.toggle("is-error", variant === "error");
  const extra = details.length
    ? `<ul>${details.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : "";
  els.sourceState.innerHTML = `<p>${escapeHtml(message)}</p>${extra}`;
}

function queueRender() {
  if (renderQueued) return;
  renderQueued = true;
  window.requestAnimationFrame(() => {
    renderQueued = false;
    renderGraph();
  });
}

function setSource(source) {
  state.source = source;
  document.querySelectorAll(".source-card").forEach((card) => {
    card.classList.toggle("is-active", card.dataset.source === source);
  });
}

function updateFilterState() {
  state.filters.skill = els.skillFilter.checked;
  state.filters.agent = els.agentFilter.checked;
  if (!state.filters.skill && !state.filters.agent) {
    setStatus("All nodes hidden", "busy");
  }
  if (state.selectedId && state.graph && !isNodeVisible(state.selectedId)) {
    clearSelection("Selected node hidden by filter");
  }
  if (state.hoveredId && state.graph && !isNodeVisible(state.hoveredId)) {
    state.hoveredId = null;
  }
  queueRender();
}

function getNodeBox(node) {
  const textWeight = Math.min(30, node.name.length * 1.2);
  const degreeWeight = Math.min(18, node.degree * 2.2);
  const width = clamp(124 + node.size * 0.2 + textWeight, 124, 184);
  const height = clamp(52 + degreeWeight + Math.min(12, Math.ceil(node.name.length / 14) * 4), 52, 74);
  return { width, height };
}

function getNodeOffset(selectionId) {
  return state.nodeOffsets[selectionId] || { x: 0, y: 0 };
}

function getNodeSceneLayout(node) {
  const offset = getNodeOffset(node.selection_id);
  const box = getNodeBox(node);
  const centerX = node.x + offset.x;
  const centerY = node.y + offset.y;
  const left = centerX - state.world.originX;
  const top = centerY - state.world.originY;
  return {
    centerX,
    centerY,
    left,
    top,
    width: box.width,
    height: box.height,
    boxLeft: left - box.width / 2,
    boxTop: top - box.height / 2,
  };
}

function recomputeWorldBounds({ resetOrigin = false } = {}) {
  if (!state.graph || !state.graph.nodes.length) {
    state.world.originX = 0;
    state.world.originY = 0;
    state.world.width = 0;
    state.world.height = 0;
    state.world.baseWidth = 0;
    state.world.baseHeight = 0;
    state.layoutMap = new Map();
    return;
  }

  const padding = state.world.padding || DEFAULT_PADDING;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const rawLayouts = [];
  const layoutMap = new Map();

  for (const node of state.graph.nodes) {
    const offset = getNodeOffset(node.selection_id);
    const box = getNodeBox(node);
    const centerX = node.x + offset.x;
    const centerY = node.y + offset.y;
    const left = centerX - box.width / 2;
    const top = centerY - box.height / 2;
    const right = centerX + box.width / 2;
    const bottom = centerY + box.height / 2;

    rawLayouts.push({
      selectionId: node.selection_id,
      centerX,
      centerY,
      left,
      top,
      width: box.width,
      height: box.height,
      right,
      bottom,
    });

    minX = Math.min(minX, left);
    minY = Math.min(minY, top);
    maxX = Math.max(maxX, right);
    maxY = Math.max(maxY, bottom);
  }

  if (resetOrigin || !Number.isFinite(state.world.originX) || state.world.baseWidth === 0) {
    state.world.originX = minX - padding;
    state.world.originY = minY - padding;
    state.world.baseWidth = Math.max(1, maxX - minX + padding * 2);
    state.world.baseHeight = Math.max(1, maxY - minY + padding * 2);
  }

  state.world.width = Math.max(state.world.baseWidth, maxX - state.world.originX + padding);
  state.world.height = Math.max(state.world.baseHeight, maxY - state.world.originY + padding);
  for (const layout of rawLayouts) {
    layoutMap.set(layout.selectionId, {
      centerX: layout.centerX,
      centerY: layout.centerY,
      sceneCenterX: layout.centerX - state.world.originX,
      sceneCenterY: layout.centerY - state.world.originY,
      left: layout.left,
      top: layout.top,
      boxLeft: layout.left - state.world.originX,
      boxTop: layout.top - state.world.originY,
      width: layout.width,
      height: layout.height,
      right: layout.right,
      bottom: layout.bottom,
    });
  }
  state.layoutMap = layoutMap;
}

function getVisibleNodes() {
  if (!state.graph) return [];
  return state.graph.nodes.filter((node) => isNodeVisible(node.selection_id));
}

function isNodeVisible(selectionId) {
  if (!state.graph) return false;
  const node = state.graph.nodes.find((item) => item.selection_id === selectionId);
  if (!node) return false;
  return Boolean(state.filters[node.surface_type]);
}

function getVisibleEdges() {
  if (!state.graph) return [];
  const visible = new Set(getVisibleNodes().map((node) => node.selection_id));
  return state.graph.edges.filter(
    (edge) => visible.has(edge.from_selection_id) && visible.has(edge.to_selection_id),
  );
}

function getFocusSet(selectionId) {
  if (!state.graph || !selectionId) return null;
  const ids = new Set([selectionId]);
  for (const edge of getVisibleEdges()) {
    if (edge.from_selection_id === selectionId) {
      ids.add(edge.to_selection_id);
    }
    if (edge.to_selection_id === selectionId) {
      ids.add(edge.from_selection_id);
    }
  }
  return ids;
}

function getNodeById(selectionId) {
  if (!state.graph) return null;
  return state.graph.nodes.find((node) => node.selection_id === selectionId) || null;
}

function updateCameraControls() {
  const modeLabel = state.camera.mode === "pan" ? "Pan" : "Select";
  els.modeButton.dataset.mode = state.camera.mode;
  els.modeButton.querySelector(".control-label").textContent = modeLabel;
  els.modeButton.setAttribute("aria-pressed", String(state.camera.mode === "pan"));
  els.modeValue.textContent = state.camera.mode === "pan" ? "Pan mode" : "Select mode";
  els.zoomValue.textContent = `${Math.round(state.camera.scale * 100)}%`;
  els.graphViewport.dataset.mode = state.camera.mode;
}

function updateCameraTransform() {
  els.graphWorld.style.width = `${Math.ceil(state.world.width)}px`;
  els.graphWorld.style.height = `${Math.ceil(state.world.height)}px`;
  els.graphWorld.style.transform = `translate(${state.camera.tx}px, ${state.camera.ty}px) scale(${state.camera.scale})`;
  updateCameraControls();
}

function fitCameraToNodes(nodes = getVisibleNodes()) {
  if (!state.graph || !nodes.length) {
    return;
  }

  const padding = 72;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    const layout = state.layoutMap.get(node.selection_id) || getNodeSceneLayout(node);
    minX = Math.min(minX, layout.boxLeft);
    minY = Math.min(minY, layout.boxTop);
    maxX = Math.max(maxX, layout.boxLeft + layout.width);
    maxY = Math.max(maxY, layout.boxTop + layout.height);
  }

  const boundsWidth = Math.max(1, maxX - minX);
  const boundsHeight = Math.max(1, maxY - minY);
  const availableWidth = Math.max(1, els.graphViewport.clientWidth - padding * 2);
  const availableHeight = Math.max(1, els.graphViewport.clientHeight - padding * 2);
  const scale = clamp(Math.min(availableWidth / boundsWidth, availableHeight / boundsHeight), MIN_ZOOM, MAX_ZOOM);
  const tx = (els.graphViewport.clientWidth - boundsWidth * scale) / 2 - minX * scale;
  const ty = (els.graphViewport.clientHeight - boundsHeight * scale) / 2 - minY * scale;

  state.camera.scale = scale;
  state.camera.tx = tx;
  state.camera.ty = ty;
  state.camera.autoFit = true;
  updateCameraTransform();
  queueRender();
}

function setCameraScale(nextScale, anchorX, anchorY) {
  const scale = clamp(nextScale, MIN_ZOOM, MAX_ZOOM);
  const worldX = (anchorX - state.camera.tx) / state.camera.scale;
  const worldY = (anchorY - state.camera.ty) / state.camera.scale;
  state.camera.scale = scale;
  state.camera.tx = anchorX - worldX * scale;
  state.camera.ty = anchorY - worldY * scale;
  state.camera.autoFit = false;
  updateCameraTransform();
  queueRender();
}

function panCamera(deltaX, deltaY) {
  state.camera.tx += deltaX;
  state.camera.ty += deltaY;
  state.camera.autoFit = false;
  updateCameraTransform();
  queueRender();
}

function resetLayout() {
  if (!state.graph) {
    setStatus("Load a graph first", "");
    return;
  }
  state.nodeOffsets = {};
  recomputeWorldBounds({ resetOrigin: true });
  state.camera.autoFit = true;
  fitCameraToNodes(getVisibleNodes().length ? getVisibleNodes() : state.graph.nodes);
  setStatus("Layout reset", "ready");
  queueRender();
}

function zoomIn() {
  const rect = els.graphViewport.getBoundingClientRect();
  setCameraScale(state.camera.scale * 1.15, rect.width / 2, rect.height / 2);
}

function zoomOut() {
  const rect = els.graphViewport.getBoundingClientRect();
  setCameraScale(state.camera.scale / 1.15, rect.width / 2, rect.height / 2);
}

function updateGraphTitle() {
  if (!state.graph) {
    els.graphTitle.textContent = "Quiet map view";
    els.graphMeta.textContent = "No graph loaded";
    return;
  }

  const source = state.graph.source;
  const visibleNodes = getVisibleNodes().length;
  const visibleEdges = getVisibleEdges().length;
  const warningCount = state.graph.warnings.length;
  const filterPieces = [];
  if (!state.filters.skill) filterPieces.push("skills hidden");
  if (!state.filters.agent) filterPieces.push("agents hidden");
  const filterText = filterPieces.length ? ` • ${filterPieces.join(", ")}` : "";

  els.graphTitle.textContent = `${source.source_id} map`;
  els.graphMeta.textContent = `${visibleNodes} visible nodes, ${visibleEdges} visible edges${warningCount ? ` • ${warningCount} warning${warningCount === 1 ? "" : "s"}` : ""}${filterText}`;
}

function renderInspector(node) {
  if (!node) {
    els.inspectorEmpty.classList.remove("is-hidden");
    els.inspectorCard.classList.add("is-hidden");
    return;
  }

  els.inspectorEmpty.classList.add("is-hidden");
  els.inspectorCard.classList.remove("is-hidden");
  els.nodeKind.textContent = node.surface_type;
  els.nodeKind.dataset.kind = node.surface_type;
  els.nodeName.textContent = node.name;
  els.nodePath.textContent = node.display_id;
  els.nodeIdentity.textContent = node.selection_id;
  els.nodeRelativePath.textContent = node.relative_path;
  els.nodeAliases.innerHTML = node.aliases.length
    ? node.aliases.map((alias) => `<span class="pill">${escapeHtml(alias)}</span>`).join("")
    : '<span class="muted">None</span>';
  els.nodeDegree.textContent = String(node.degree);

  const outgoing = [];
  const incoming = [];
  const relatedEdges = state.graph.edges.filter(
    (edge) => edge.from_selection_id === node.selection_id || edge.to_selection_id === node.selection_id,
  );

  for (const edge of relatedEdges) {
    const from = getNodeById(edge.from_selection_id);
    const to = getNodeById(edge.to_selection_id);
    const visible = from && to && isNodeVisible(from.selection_id) && isNodeVisible(to.selection_id);
    const isOutgoing = edge.from_selection_id === node.selection_id;
    const other = isOutgoing ? to : from;
    const label = isOutgoing ? "Outgoing" : "Incoming";
    const item = {
      title: other ? other.name : (isOutgoing ? edge.to_selection_id : edge.from_selection_id),
      matchText: edge.match_text,
      evidencePath: edge.evidence_path,
      matchKind: edge.match_kind,
      targetId: other ? other.selection_id : null,
      visible,
      direction: label,
    };
    if (isOutgoing) {
      outgoing.push(item);
    } else {
      incoming.push(item);
    }
  }

  els.outgoingList.innerHTML = renderEdgeList(node, outgoing);
  els.incomingList.innerHTML = renderEdgeList(node, incoming);
}

function renderEdgeList(node, items) {
  if (!items.length) {
    return '<p class="empty-note">No detected edges.</p>';
  }

  return items
    .map((item) => {
      if (item.targetId && item.visible) {
        return `
          <button class="connection-item" type="button" data-target="${escapeHtml(item.targetId)}">
            <span>${escapeHtml(item.direction)} -> ${escapeHtml(item.title)}</span>
            <strong>${escapeHtml(item.matchText)}</strong>
            <span>${escapeHtml(item.evidencePath)} • ${escapeHtml(item.matchKind)}</span>
          </button>
        `;
      }
      return `
        <div class="connection-item is-muted">
          <span>${escapeHtml(item.direction)} -> ${escapeHtml(item.title)}</span>
          <strong>${escapeHtml(item.matchText)}</strong>
          <span>${escapeHtml(item.evidencePath)} • ${escapeHtml(item.matchKind)}</span>
        </div>
      `;
    })
    .join("");
}

function renderMinimap() {
  if (!state.graph) {
    els.minimapSvg.innerHTML = "";
    state.dom.miniNodes.clear();
    state.dom.miniViewport = null;
    return;
  }

  const miniWidth = 220;
  const miniHeight = 160;
  const pad = 12;
  const boundsWidth = Math.max(1, state.world.width);
  const boundsHeight = Math.max(1, state.world.height);
  const scale = Math.min((miniWidth - pad * 2) / boundsWidth, (miniHeight - pad * 2) / boundsHeight);
  const offsetX = (miniWidth - boundsWidth * scale) / 2;
  const offsetY = (miniHeight - boundsHeight * scale) / 2;
  const visibleIds = new Set(getVisibleNodes().map((node) => node.selection_id));

  if (!state.dom.miniViewport) {
    els.minimapSvg.innerHTML = "";
    for (const node of state.graph.nodes) {
      const circle = document.createElementNS(SVG_NS, "circle");
      circle.setAttribute("r", "3.2");
      circle.classList.add("minimap-node", `is-${node.surface_type}`);
      circle.dataset.selectionId = node.selection_id;
      els.minimapSvg.appendChild(circle);
      state.dom.miniNodes.set(node.selection_id, circle);
    }
    const viewportRect = document.createElementNS(SVG_NS, "rect");
    viewportRect.classList.add("minimap-viewport");
    viewportRect.setAttribute("rx", "2.5");
    viewportRect.setAttribute("ry", "2.5");
    els.minimapSvg.appendChild(viewportRect);
    state.dom.miniViewport = viewportRect;
  }

  for (const node of state.graph.nodes) {
    const circle = state.dom.miniNodes.get(node.selection_id);
    if (!circle) continue;
    const layout = state.layoutMap.get(node.selection_id);
    const visible = visibleIds.has(node.selection_id);
    circle.hidden = !visible;
    if (!layout) continue;
    circle.setAttribute("cx", `${layout.sceneCenterX * scale + offsetX}`);
    circle.setAttribute("cy", `${layout.sceneCenterY * scale + offsetY}`);
  }

  const viewportLeft = (-state.camera.tx) / state.camera.scale;
  const viewportTop = (-state.camera.ty) / state.camera.scale;
  const viewportWidth = els.graphViewport.clientWidth / state.camera.scale;
  const viewportHeight = els.graphViewport.clientHeight / state.camera.scale;
  state.dom.miniViewport.setAttribute("x", `${viewportLeft * scale + offsetX}`);
  state.dom.miniViewport.setAttribute("y", `${viewportTop * scale + offsetY}`);
  state.dom.miniViewport.setAttribute("width", `${viewportWidth * scale}`);
  state.dom.miniViewport.setAttribute("height", `${viewportHeight * scale}`);
}

function renderGraphDom() {
  if (!state.graph) {
    els.nodeLayer.innerHTML = "";
    els.edgeLayer.innerHTML = "";
    els.graphEmpty.hidden = false;
    els.graphEmpty.querySelector("h3").textContent = "No graph yet";
    els.graphEmpty.querySelector("p").textContent = "Load Global, Local, or Custom to inspect the graph.";
    els.graphMeta.textContent = "No graph loaded";
    els.graphWorld.style.width = "0px";
    els.graphWorld.style.height = "0px";
    updateCameraTransform();
    renderInspector(null);
    renderMinimap();
    return;
  }

  recomputeWorldBounds();
  const visibleNodes = new Set(getVisibleNodes().map((node) => node.selection_id));
  const focusNodeId = state.hoveredId || state.selectedId;
  const focusSet = getFocusSet(focusNodeId);
  const activeEdges = new Set();
  if (focusNodeId) {
    for (const edge of getVisibleEdges()) {
      if (edge.from_selection_id === focusNodeId || edge.to_selection_id === focusNodeId) {
        activeEdges.add(`${edge.from_selection_id}|${edge.to_selection_id}|${edge.match_text}|${edge.evidence_path}`);
      }
    }
  }

  for (const node of state.graph.nodes) {
    let nodeEl = state.dom.nodes.get(node.selection_id);
    if (!nodeEl) {
      nodeEl = document.createElement("button");
      nodeEl.type = "button";
      nodeEl.className = "graph-node";
      nodeEl.dataset.selectionId = node.selection_id;
      nodeEl.dataset.surfaceType = node.surface_type;
      nodeEl.addEventListener("click", () => {
        if (state.suppressedNodeClickId === node.selection_id) {
          state.suppressedNodeClickId = null;
          return;
        }
        selectNode(node.selection_id);
      });
      nodeEl.addEventListener("pointerenter", () => {
        if (!isNodeVisible(node.selection_id)) return;
        setHoverNode(node.selection_id);
      });
      nodeEl.addEventListener("pointerleave", () => {
        if (state.hoveredId === node.selection_id) {
          clearHover();
        }
      });
      nodeEl.addEventListener("focus", () => {
        if (isNodeVisible(node.selection_id)) {
          setHoverNode(node.selection_id);
        }
      });
      nodeEl.addEventListener("blur", () => {
        if (state.hoveredId === node.selection_id) {
          clearHover();
        }
      });
      nodeEl.innerHTML = `
        <div class="node-head">
          <span class="node-kind" data-kind="${escapeHtml(node.surface_type)}">${escapeHtml(node.surface_type)}</span>
          <span class="node-degree">${escapeHtml(String(node.degree))}</span>
        </div>
        <strong class="node-name">${escapeHtml(node.name)}</strong>
        <span class="node-path">${escapeHtml(node.display_id)}</span>
        <span class="node-foot">${escapeHtml(node.relative_path)}</span>
      `;
      els.nodeLayer.appendChild(nodeEl);
      state.dom.nodes.set(node.selection_id, nodeEl);
    }

    const layout = state.layoutMap.get(node.selection_id);
    if (!layout) continue;
    const visible = visibleNodes.has(node.selection_id);
    const isSelected = state.selectedId === node.selection_id;
    const isHovered = state.hoveredId === node.selection_id;
    const isActive = !focusSet || focusSet.has(node.selection_id) || isSelected;
    nodeEl.hidden = !visible;
    nodeEl.style.left = `${layout.boxLeft}px`;
    nodeEl.style.top = `${layout.boxTop}px`;
    nodeEl.style.width = `${layout.width}px`;
    nodeEl.style.height = `${layout.height}px`;
    nodeEl.style.zIndex = `${100 + node.degree + (isSelected ? 50 : 0) + (isHovered ? 25 : 0)}`;
    nodeEl.className = [
      "graph-node",
      `is-${node.surface_type}`,
      isSelected ? "is-selected" : "",
      isHovered ? "is-hovered" : "",
      !isActive && !isSelected ? "is-dim" : "",
      state.interaction && state.interaction.kind === "node" && state.interaction.nodeId === node.selection_id ? "is-dragging" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  for (const edge of state.graph.edges) {
    const key = `${edge.from_selection_id}|${edge.to_selection_id}|${edge.match_text}|${edge.evidence_path}`;
    let edgeEl = state.dom.edges.get(key);
    if (!edgeEl) {
      edgeEl = document.createElementNS(SVG_NS, "path");
      edgeEl.classList.add("edge");
      edgeEl.dataset.edgeId = key;
      els.edgeLayer.appendChild(edgeEl);
      state.dom.edges.set(key, edgeEl);
    }

    const fromVisible = visibleNodes.has(edge.from_selection_id);
    const toVisible = visibleNodes.has(edge.to_selection_id);
    const shouldShow = fromVisible && toVisible;
    edgeEl.hidden = !shouldShow;
    if (!shouldShow) continue;

    const fromLayout = state.layoutMap.get(edge.from_selection_id);
    const toLayout = state.layoutMap.get(edge.to_selection_id);
    if (!fromLayout || !toLayout) continue;

    const startX = fromLayout.centerX - state.world.originX;
    const startY = fromLayout.centerY - state.world.originY;
    const endX = toLayout.centerX - state.world.originX;
    const endY = toLayout.centerY - state.world.originY;
    const direction = Math.sign(endX - startX) || 1;
    const bend = clamp(Math.abs(endX - startX) * 0.28, 24, 92);
    const path = `M ${startX} ${startY} C ${startX + direction * bend} ${startY}, ${endX - direction * bend} ${endY}, ${endX} ${endY}`;
    edgeEl.setAttribute("d", path);
    edgeEl.setAttribute(
      "class",
      `edge ${focusNodeId && activeEdges.has(key) ? "is-active" : focusNodeId ? "is-dim" : "is-active"}`,
    );
  }

  const visibleCount = visibleNodes.size;
  if (!visibleCount) {
    els.graphEmpty.hidden = false;
    els.graphEmpty.querySelector("h3").textContent = "No visible nodes";
    els.graphEmpty.querySelector("p").textContent = "Use the filters to show at least one node type.";
  } else {
    els.graphEmpty.hidden = true;
  }

  if (state.selectedId && !isNodeVisible(state.selectedId)) {
    clearSelection("Selected node hidden by filter");
  } else if (state.selectedId) {
    renderInspector(getNodeById(state.selectedId));
  } else {
    renderInspector(null);
  }

  updateGraphTitle();
  updateCameraTransform();
  renderMinimap();
}

function renderGraph() {
  if (!state.graph) {
    renderGraphDom();
    return;
  }
  renderGraphDom();
}

function setHoverNode(selectionId) {
  if (!selectionId || !isNodeVisible(selectionId)) return;
  if (state.hoveredId === selectionId) return;
  state.hoveredId = selectionId;
  queueRender();
}

function clearHover() {
  if (!state.hoveredId) return;
  state.hoveredId = null;
  queueRender();
}

function ensureInspectorOpen() {
  if (isDesktopLayout()) {
    state.ui.inspectorCollapsed = false;
  } else {
    state.ui.inspectorOpen = true;
  }
  syncResponsivePanels();
}

function selectNode(selectionId, options = {}) {
  const node = getNodeById(selectionId);
  if (!node || !isNodeVisible(selectionId)) {
    clearSelection("Selected node hidden by filter");
    return;
  }
  state.selectedId = selectionId;
  ensureInspectorOpen();
  renderInspector(node);
  queueRender();
  if (!options.quiet) {
    setStatus(`Selected ${node.name}`, "selected");
  }
}

function clearSelection(message = "Selection cleared") {
  state.selectedId = null;
  state.ui.inspectorOpen = false;
  renderInspector(null);
  syncResponsivePanels();
  queueRender();
  setStatus(message, "");
}

function setSourceStateForGraph(graph) {
  const details = [
    `${graph.source.root_path}`,
    `${graph.nodes.length} nodes, ${graph.edges.length} edges`,
  ];
  if (graph.warnings.length) {
    details.push(...graph.warnings.slice(0, 4));
  }
  renderSourceState(`${graph.source.source_id} loaded`, "ready", details);
}

async function loadGraph() {
  closeHelp();
  closeMenu();
  if (state.source === "custom") {
    state.customPath = els.customPath.value.trim();
    if (!state.customPath) {
      state.error = { error: "invalid_source", message: "Enter a custom path first." };
      renderSourceState(state.error.message, "error");
      setStatus("Custom path needed", "error");
      return;
    }
  }

  setLoading(true);
  state.error = null;
  state.selectedId = null;
  state.hoveredId = null;
  state.nodeOffsets = {};
  state.suppressedNodeClickId = null;
  renderSourceState("Loading graph...", "busy");
  setStatus("Loading graph...", "busy");

  try {
    const graph = await fetchJson(currentSourceUrl());
    state.graph = graph;
    recomputeWorldBounds({ resetOrigin: true });
    buildGraphDom();
    state.camera.autoFit = true;
    fitCameraToNodes(getVisibleNodes().length ? getVisibleNodes() : state.graph.nodes);
    setSourceStateForGraph(graph);
    setStatus(`${graph.source.source_id} loaded`, "ready");
    updateGraphTitle();
    renderInspector(null);
    queueRender();
  } catch (error) {
    state.graph = null;
    state.selectedId = null;
    state.hoveredId = null;
    state.error = error.payload || { error: "invalid_source", message: error.message };
    state.camera.scale = 1;
    state.camera.tx = 0;
    state.camera.ty = 0;
    state.camera.autoFit = true;
    renderGraphDom();
    renderSourceState(state.error.message || "Invalid source", "error");
    setStatus("Invalid source", "error");
  } finally {
    setLoading(false);
  }
}

function buildGraphDom() {
  els.nodeLayer.innerHTML = "";
  els.edgeLayer.innerHTML = "";
  state.dom.nodes.clear();
  state.dom.edges.clear();
  state.dom.miniNodes.clear();
  state.dom.miniViewport = null;

  if (!state.graph) {
    renderGraphDom();
    return;
  }

  for (const edge of state.graph.edges) {
    const key = `${edge.from_selection_id}|${edge.to_selection_id}|${edge.match_text}|${edge.evidence_path}`;
    const edgeEl = document.createElementNS(SVG_NS, "path");
    edgeEl.classList.add("edge");
    edgeEl.dataset.edgeId = key;
    els.edgeLayer.appendChild(edgeEl);
    state.dom.edges.set(key, edgeEl);
  }

  for (const node of state.graph.nodes) {
    const nodeEl = document.createElement("button");
    nodeEl.type = "button";
    nodeEl.className = "graph-node";
    nodeEl.dataset.selectionId = node.selection_id;
    nodeEl.dataset.surfaceType = node.surface_type;
    nodeEl.addEventListener("click", () => {
      if (state.suppressedNodeClickId === node.selection_id) {
        state.suppressedNodeClickId = null;
        return;
      }
      selectNode(node.selection_id);
    });
    nodeEl.addEventListener("pointerenter", () => {
      if (isNodeVisible(node.selection_id)) {
        setHoverNode(node.selection_id);
      }
    });
    nodeEl.addEventListener("pointerleave", () => {
      if (state.hoveredId === node.selection_id) {
        clearHover();
      }
    });
    nodeEl.addEventListener("focus", () => {
      if (isNodeVisible(node.selection_id)) {
        setHoverNode(node.selection_id);
      }
    });
    nodeEl.addEventListener("blur", () => {
      if (state.hoveredId === node.selection_id) {
        clearHover();
      }
    });
    nodeEl.innerHTML = `
      <div class="node-head">
        <span class="node-kind" data-kind="${escapeHtml(node.surface_type)}">${escapeHtml(node.surface_type)}</span>
        <span class="node-degree">${escapeHtml(String(node.degree))}</span>
      </div>
      <strong class="node-name">${escapeHtml(node.name)}</strong>
      <span class="node-path">${escapeHtml(node.display_id)}</span>
      <span class="node-foot">${escapeHtml(node.relative_path)}</span>
    `;
    els.nodeLayer.appendChild(nodeEl);
    state.dom.nodes.set(node.selection_id, nodeEl);
  }

  if (!state.dom.miniViewport) {
    els.minimapSvg.innerHTML = "";
    for (const node of state.graph.nodes) {
      const circle = document.createElementNS(SVG_NS, "circle");
      circle.setAttribute("r", "3.2");
      circle.classList.add("minimap-node", `is-${node.surface_type}`);
      circle.dataset.selectionId = node.selection_id;
      els.minimapSvg.appendChild(circle);
      state.dom.miniNodes.set(node.selection_id, circle);
    }
    const viewportRect = document.createElementNS(SVG_NS, "rect");
    viewportRect.classList.add("minimap-viewport");
    viewportRect.setAttribute("rx", "2.5");
    viewportRect.setAttribute("ry", "2.5");
    els.minimapSvg.appendChild(viewportRect);
    state.dom.miniViewport = viewportRect;
  }

  renderGraphDom();
}

function syncBackdrop() {
  const open = state.ui.sourcesOpen || state.ui.inspectorOpen || state.ui.menuOpen || state.ui.helpOpen;
  els.drawerBackdrop.hidden = !open;
}

function closeHelp() {
  state.ui.helpOpen = false;
  setVisible(els.helpPopover, false);
  syncBackdrop();
}

function closeMenu() {
  state.ui.menuOpen = false;
  setVisible(els.menuPopover, false);
  syncBackdrop();
}

function closeSourcesPanel() {
  if (isDesktopLayout()) {
    state.ui.sourcesCollapsed = true;
  } else {
    state.ui.sourcesOpen = false;
  }
  syncResponsivePanels();
}

function closeInspectorPanel() {
  if (isDesktopLayout()) {
    state.ui.inspectorCollapsed = true;
  } else {
    state.ui.inspectorOpen = false;
  }
  syncResponsivePanels();
}

function toggleSourcesPanel() {
  if (isDesktopLayout()) {
    state.ui.sourcesCollapsed = !state.ui.sourcesCollapsed;
  } else {
    state.ui.sourcesOpen = !state.ui.sourcesOpen;
  }
  syncResponsivePanels();
}

function toggleInspectorPanel() {
  if (isDesktopLayout()) {
    state.ui.inspectorCollapsed = !state.ui.inspectorCollapsed;
  } else {
    state.ui.inspectorOpen = !state.ui.inspectorOpen;
  }
  syncResponsivePanels();
}

function openHelp() {
  state.ui.helpOpen = true;
  setVisible(els.helpPopover, true);
  setVisible(els.menuPopover, false);
  state.ui.menuOpen = false;
  syncBackdrop();
}

function toggleHelp() {
  if (state.ui.helpOpen) {
    closeHelp();
  } else {
    openHelp();
  }
}

function openMenu() {
  state.ui.menuOpen = true;
  setVisible(els.menuPopover, true);
  setVisible(els.helpPopover, false);
  state.ui.helpOpen = false;
  syncBackdrop();
}

function toggleMenu() {
  if (state.ui.menuOpen) {
    closeMenu();
  } else {
    openMenu();
  }
}

async function copySourceUrl() {
  const url = currentShareUrl();
  try {
    await navigator.clipboard.writeText(url);
    setStatus("Source URL copied", "ready");
  } catch {
    setStatus("Copy failed", "error");
  }
}

function setLoading(loading) {
  state.loading = loading;
  document.body.classList.toggle("is-loading", loading);
}

function clearGraph() {
  closeHelp();
  closeMenu();
  state.graph = null;
  state.selectedId = null;
  state.hoveredId = null;
  state.nodeOffsets = {};
  state.error = null;
  state.interaction = null;
  state.camera.scale = 1;
  state.camera.tx = 0;
  state.camera.ty = 0;
  state.camera.autoFit = true;
  updateCameraTransform();
  els.nodeLayer.innerHTML = "";
  els.edgeLayer.innerHTML = "";
  state.dom.nodes.clear();
  state.dom.edges.clear();
  state.dom.miniNodes.clear();
  state.dom.miniViewport = null;
  renderGraphDom();
  renderSourceState("Choose a source and load it to draw the graph.");
  setStatus("Pick a source", "");
}

async function handleMenuAction(action) {
  if (action === "reload") {
    await loadGraph();
    closeMenu();
    return;
  }
  if (action === "reset-layout") {
    resetLayout();
    closeMenu();
    return;
  }
  if (action === "copy-source") {
    await copySourceUrl();
    closeMenu();
    return;
  }
  if (action === "clear-selection") {
    clearSelection();
    closeMenu();
  }
}

function beginInteraction(event) {
  if (!state.graph) return;
  if (event.button !== 0) return;
  const targetNode = event.target.closest?.(".graph-node");
  const point = getViewportPoint(event);

  if (targetNode && targetNode.dataset.selectionId) {
    const nodeId = targetNode.dataset.selectionId;
    const layout = state.layoutMap.get(nodeId);
    if (!layout) return;
    state.interaction = {
      kind: "node",
      nodeId,
      pointerId: event.pointerId,
      startX: point.x,
      startY: point.y,
      startOffsetX: getNodeOffset(nodeId).x,
      startOffsetY: getNodeOffset(nodeId).y,
      dragged: false,
    };
    targetNode.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    return;
  }

  state.interaction = {
    kind: "pan",
    pointerId: event.pointerId,
    startX: point.x,
    startY: point.y,
    startTx: state.camera.tx,
    startTy: state.camera.ty,
    dragged: false,
  };
  els.graphViewport.setPointerCapture?.(event.pointerId);
}

function getViewportPoint(event) {
  const rect = els.graphViewport.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function updateInteraction(event) {
  if (!state.interaction || event.pointerId !== state.interaction.pointerId) return;
  const point = getViewportPoint(event);
  const dx = point.x - state.interaction.startX;
  const dy = point.y - state.interaction.startY;

  if (state.interaction.kind === "pan") {
    if (!state.interaction.dragged && Math.hypot(dx, dy) < 4) {
      return;
    }
    state.interaction.dragged = true;
    state.camera.tx = state.interaction.startTx + dx;
    state.camera.ty = state.interaction.startTy + dy;
    state.camera.autoFit = false;
    updateCameraTransform();
    queueRender();
    return;
  }

  if (state.interaction.kind === "node") {
    if (!state.interaction.dragged && Math.hypot(dx, dy) < 4) {
      return;
    }
    state.interaction.dragged = true;
    const offsetX = state.interaction.startOffsetX + dx / state.camera.scale;
    const offsetY = state.interaction.startOffsetY + dy / state.camera.scale;
    state.nodeOffsets[state.interaction.nodeId] = { x: offsetX, y: offsetY };
    state.camera.autoFit = false;
    queueRender();
  }
}

function endInteraction(event) {
  if (!state.interaction || event.pointerId !== state.interaction.pointerId) return;
  const interaction = state.interaction;
  state.interaction = null;

  if (interaction.kind === "node" && interaction.dragged) {
    state.suppressedNodeClickId = interaction.nodeId;
    window.requestAnimationFrame(() => {
      if (state.suppressedNodeClickId === interaction.nodeId) {
        state.suppressedNodeClickId = null;
      }
    });
    setStatus("Node repositioned", "ready");
    queueRender();
    return;
  }

  if (interaction.kind === "node" && !interaction.dragged) {
    selectNode(interaction.nodeId);
    return;
  }

  if (interaction.kind === "pan" && !interaction.dragged && state.camera.mode === "select") {
    clearSelection("Selection cleared");
  }
}

function handleWheel(event) {
  if (!state.graph) return;
  event.preventDefault();
  const point = getViewportPoint(event);
  const direction = event.deltaY > 0 ? -1 : 1;
  const factor = direction > 0 ? 1.12 : 1 / 1.12;
  setCameraScale(state.camera.scale * factor, point.x, point.y);
}

function toggleMode() {
  state.camera.mode = state.camera.mode === "select" ? "pan" : "select";
  updateCameraControls();
  setStatus(state.camera.mode === "pan" ? "Pan mode" : "Select mode", "ready");
}

function hydrateElements() {
  els.app = $("#app");
  els.statusChip = $("#statusChip");
  els.sourcePanel = $("#sourcePanel");
  els.inspectorPanel = $("#inspectorPanel");
  els.graphViewport = $("#graphViewport");
  els.graphWorld = $("#graphWorld");
  els.graphEmpty = $("#graphEmpty");
  els.edgeLayer = $("#edgeLayer");
  els.nodeLayer = $("#nodeLayer");
  els.graphTitle = $("#graphTitle");
  els.graphMeta = $("#graphMeta");
  els.sourceState = $("#sourceState");
  els.customPath = $("#customPath");
  els.loadButton = $("#loadButton");
  els.clearButton = $("#clearButton");
  els.skillFilter = $("#skillFilter");
  els.agentFilter = $("#agentFilter");
  els.drawerBackdrop = $("#drawerBackdrop");
  els.inspectorEmpty = $("#inspectorEmpty");
  els.inspectorCard = $("#inspectorCard");
  els.nodeKind = $("#nodeKind");
  els.nodeName = $("#nodeName");
  els.nodePath = $("#nodePath");
  els.nodeIdentity = $("#nodeIdentity");
  els.nodeRelativePath = $("#nodeRelativePath");
  els.nodeAliases = $("#nodeAliases");
  els.nodeDegree = $("#nodeDegree");
  els.outgoingList = $("#outgoingList");
  els.incomingList = $("#incomingList");
  els.topbarSourcesButton = $("#topbarSourcesButton");
  els.layoutButton = $("#layoutButton");
  els.fitButton = $("#fitButton");
  els.fitCanvasButton = $("#fitCanvasButton");
  els.helpButton = $("#helpButton");
  els.menuButton = $("#menuButton");
  els.modeButton = $("#modeButton");
  els.zoomOutButton = $("#zoomOutButton");
  els.zoomInButton = $("#zoomInButton");
  els.zoomValue = $("#zoomValue");
  els.modeValue = $("#modeValue");
  els.helpPopover = $("#helpPopover");
  els.menuPopover = $("#menuPopover");
  els.minimapSvg = $("#minimapSvg");
}

function bindUi() {
  document.querySelectorAll(".source-card").forEach((card) => {
    card.addEventListener("click", () => {
      setSource(card.dataset.source);
      if (card.dataset.source !== "custom") {
        void loadGraph();
      } else {
        setStatus("Enter a custom path", "");
      }
    });
  });

  els.topbarSourcesButton.addEventListener("click", toggleSourcesPanel);
  document.querySelectorAll('[data-action="sources"]').forEach((button) => {
    button.addEventListener("click", toggleSourcesPanel);
  });
  document.querySelectorAll('[data-action="close-sources"]').forEach((button) => {
    button.addEventListener("click", closeSourcesPanel);
  });

  document.querySelectorAll('[data-action="inspector"]').forEach((button) => {
    button.addEventListener("click", toggleInspectorPanel);
  });
  document.querySelectorAll('[data-action="close-inspector"]').forEach((button) => {
    button.addEventListener("click", closeInspectorPanel);
  });

  els.layoutButton.addEventListener("click", resetLayout);
  els.fitButton.addEventListener("click", () => fitCameraToNodes(getVisibleNodes().length ? getVisibleNodes() : state.graph?.nodes || []));
  els.fitCanvasButton.addEventListener("click", () => fitCameraToNodes(getVisibleNodes().length ? getVisibleNodes() : state.graph?.nodes || []));
  els.helpButton.addEventListener("click", toggleHelp);
  els.menuButton.addEventListener("click", toggleMenu);
  els.modeButton.addEventListener("click", toggleMode);
  els.zoomInButton.addEventListener("click", zoomIn);
  els.zoomOutButton.addEventListener("click", zoomOut);

  els.loadButton.addEventListener("click", () => {
    void loadGraph();
  });

  els.clearButton.addEventListener("click", clearGraph);

  els.skillFilter.addEventListener("change", updateFilterState);
  els.agentFilter.addEventListener("change", updateFilterState);

  els.customPath.addEventListener("input", () => {
    state.customPath = els.customPath.value;
    if (state.source === "custom" && !state.loading) {
      renderSourceState("Choose a source and load it to draw the graph.");
    }
  });

  els.customPath.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void loadGraph();
    }
  });

  els.drawerBackdrop.addEventListener("click", () => {
    closeHelp();
    closeMenu();
    if (isDesktopLayout()) {
      state.ui.sourcesCollapsed = true;
      state.ui.inspectorCollapsed = true;
    } else {
      state.ui.sourcesOpen = false;
      state.ui.inspectorOpen = false;
    }
    syncResponsivePanels();
  });

  document.querySelectorAll(".menu-item").forEach((button) => {
    button.addEventListener("click", () => {
      void handleMenuAction(button.dataset.menuAction);
    });
  });

  document.querySelectorAll('[data-action="close-help"]').forEach((button) => {
    button.addEventListener("click", closeHelp);
  });
  document.querySelectorAll('[data-action="close-menu"]').forEach((button) => {
    button.addEventListener("click", closeMenu);
  });

  els.graphViewport.addEventListener("pointerdown", beginInteraction);
  els.graphViewport.addEventListener("pointermove", updateInteraction);
  els.graphViewport.addEventListener("pointerup", endInteraction);
  els.graphViewport.addEventListener("pointercancel", endInteraction);
  els.graphViewport.addEventListener("mouseleave", () => {
    if (!state.interaction || state.interaction.kind !== "pan") {
      clearHover();
    }
  });
  els.graphViewport.addEventListener("wheel", handleWheel, { passive: false });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeHelp();
      closeMenu();
      if (isDesktopLayout()) {
        state.ui.sourcesCollapsed = true;
        state.ui.inspectorCollapsed = true;
      } else {
        state.ui.sourcesOpen = false;
        state.ui.inspectorOpen = false;
      }
      syncResponsivePanels();
    }
  });

  window.addEventListener("resize", () => {
    syncResponsivePanels();
    if (state.camera.autoFit && state.graph) {
      fitCameraToNodes(getVisibleNodes().length ? getVisibleNodes() : state.graph.nodes);
    } else {
      queueRender();
    }
  });

  resizeObserver = new ResizeObserver(() => {
    if (state.camera.autoFit && state.graph) {
      fitCameraToNodes(getVisibleNodes().length ? getVisibleNodes() : state.graph.nodes);
    } else {
      queueRender();
    }
  });
  resizeObserver.observe(els.graphViewport);
}

function hydrateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const source = params.get("source");
  const path = params.get("path");
  let shouldAutoLoad = false;
  if (source) {
    setSource(source);
    shouldAutoLoad = true;
  }
  if (path) {
    els.customPath.value = path;
    state.customPath = path;
    shouldAutoLoad = true;
  }
  return shouldAutoLoad;
}

function syncResponsivePanels() {
  const tablet = window.matchMedia("(max-width: 1100px)").matches;
  const mobile = isMobileLayout();

  document.body.classList.toggle("is-tablet", tablet && !mobile);
  document.body.classList.toggle("is-mobile", mobile);

  if (!tablet) {
    document.body.classList.toggle("sources-collapsed", state.ui.sourcesCollapsed);
    document.body.classList.toggle("inspector-collapsed", state.ui.inspectorCollapsed);
    els.sourcePanel.classList.remove("is-open");
    els.inspectorPanel.classList.remove("is-open");
  } else {
    document.body.classList.remove("sources-collapsed", "inspector-collapsed");
    els.sourcePanel.classList.toggle("is-open", state.ui.sourcesOpen);
    els.inspectorPanel.classList.toggle("is-open", state.ui.inspectorOpen);
  }

  els.helpPopover.hidden = !state.ui.helpOpen;
  els.menuPopover.hidden = !state.ui.menuOpen;
  syncBackdrop();
}

function syncOverlayPlacement() {
  if (isDesktopLayout()) {
    els.inspectorPanel.hidden = Boolean(state.ui.inspectorCollapsed);
    els.sourcePanel.hidden = Boolean(state.ui.sourcesCollapsed);
  } else {
    els.inspectorPanel.hidden = false;
    els.sourcePanel.hidden = false;
  }
}

function updateSourceSummary() {
  if (!state.graph) {
    renderSourceState("Choose a source and load it to draw the graph.");
    return;
  }
  setSourceStateForGraph(state.graph);
}

function refreshDomAfterLayoutChange() {
  updateCameraTransform();
  updateGraphTitle();
  queueRender();
  syncOverlayPlacement();
}

async function boot() {
  hydrateElements();
  bindUi();
  const shouldAutoLoad = hydrateFromUrl();
  syncResponsivePanels();
  updateCameraControls();
  renderSourceState("Choose a source and load it to draw the graph.");
  if (shouldAutoLoad) {
    await loadGraph();
  }
  if (!state.graph) {
    renderGraphDom();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  void boot();
});
