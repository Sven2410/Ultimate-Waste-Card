/**
 * Ultimate Waste Card
 * A custom Lovelace card for Home Assistant
 * Displays waste collection dates as glass-style chips
 *
 * Version: 1.0.0
 */

/* ============================================================
   WASTE TYPE DEFINITIONS
   ============================================================ */
const WASTE_TYPES = {
  restafval:  { name: "Restafval",  icon: "mdi:recycle",                    color: "#9E9E9E" },
  gft:        { name: "GFT",        icon: "mdi:apple",                      color: "#4CAF50" },
  papier:     { name: "Papier",     icon: "mdi:newspaper-variant-outline",  color: "#2196F3" },
  pmd:        { name: "PMD",        icon: "mdi:bottle-soda-outline",        color: "#FF6D00" },
  gftgratis:  { name: "GFT gratis", icon: "mdi:leaf",                       color: "#66BB6A" },
  textiel:    { name: "Textiel",    icon: "mdi:tshirt-crew",                color: "#8D6E63" },
  glas:       { name: "Glas",       icon: "mdi:glass-fragile",              color: "#00897B" },
  grofvuil:   { name: "Grofvuil",   icon: "mdi:sofa",                       color: "#795548" },
  asbest:     { name: "Asbest",     icon: "mdi:alert-octagon",              color: "#E53935" },
  apparaten:  { name: "Apparaten",  icon: "mdi:washing-machine",            color: "#5C6BC0" },
  chemisch:   { name: "Chemisch",   icon: "mdi:flask-outline",              color: "#AB47BC" },
  sloopafval: { name: "Sloopafval", icon: "mdi:hammer-wrench",              color: "#78909C" },
  takken:     { name: "Takken",     icon: "mdi:tree",                       color: "#33691E" },
  pbd:        { name: "PBD",        icon: "mdi:package-variant",            color: "#FF8F00" },
  duobak:     { name: "Duobak",     icon: "mdi:delete-outline",             color: "#607D8B" },
  restwagen:  { name: "Restwagen",  icon: "mdi:truck",                      color: "#757575" },
  sortibak:   { name: "Sortibak",   icon: "mdi:sort",                       color: "#00ACC1" },
};

/* ============================================================
   EDITOR
   ============================================================ */
class UltimateWasteCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this.attachShadow({ mode: "open" });
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) {
      this._buildDOM();
    } else {
      this.shadowRoot.querySelectorAll("ha-entity-picker").forEach((p) => (p.hass = hass));
    }
  }

  setConfig(config) {
    this._config = { ...config, items: config.items || [] };
    if (this._rendered) {
      this._renderItems();
    }
  }

  _buildDOM() {
    if (!this._hass) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; }
        .row { display:flex; flex-direction:column; gap:6px; margin-bottom:16px; }
        label { font-size:13px; font-weight:500; color:var(--primary-text-color); }
        ha-textfield { display:block; width:100%; }

        .items-header {
          display:flex; align-items:center; justify-content:space-between;
          margin-bottom:8px;
        }
        .items-header label { margin:0; }

        .item-row {
          display:flex; align-items:center; gap:8px;
          padding:10px 12px; margin-bottom:8px;
          background: var(--card-background-color, #1c1c1c);
          border: 1px solid var(--divider-color, #333);
          border-radius: 10px;
        }
        .item-dot {
          width:10px; height:10px; border-radius:50%; flex-shrink:0;
        }
        .item-info {
          flex:1; display:flex; flex-direction:column; gap:4px; min-width:0;
        }
        .item-type-name {
          font-size:13px; font-weight:600;
          color: var(--primary-text-color);
        }
        .item-entity {
          font-size:11px; color: var(--secondary-text-color);
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }
        .item-remove {
          background:none; border:none; cursor:pointer; padding:4px;
          color: var(--error-color, #cf6679); font-size:18px; line-height:1;
          border-radius:4px;
        }
        .item-remove:hover { background:rgba(207,102,121,0.15); }

        .add-section {
          display:flex; flex-direction:column; gap:8px;
          padding:12px; margin-top:4px;
          border: 1px dashed var(--divider-color, #444);
          border-radius:10px;
        }
        .add-row {
          display:flex; gap:8px; align-items:flex-end;
        }
        .add-row select {
          flex:1; padding:9px 10px;
          background: var(--card-background-color, #1c1c1c);
          color: var(--primary-text-color, #fff);
          border:1px solid var(--divider-color, #444);
          border-radius:8px; font-size:13px;
          font-family: var(--primary-font-family, sans-serif);
          cursor:pointer; outline:none;
          -webkit-appearance:none; appearance:none;
        }
        .add-row select option {
          background: var(--card-background-color, #1c1c1c);
          color: var(--primary-text-color, #fff);
        }
        .add-row ha-entity-picker { flex:2; }
        .add-btn {
          padding:8px 16px;
          background: var(--primary-color, #03a9f4);
          color:#fff; border:none; border-radius:8px;
          font-size:13px; font-weight:600; cursor:pointer;
          font-family: var(--primary-font-family, sans-serif);
          white-space:nowrap; flex-shrink:0;
        }
        .add-btn:hover { opacity:0.85; }
        .add-btn:disabled { opacity:0.4; cursor:default; }

        .empty-msg {
          text-align:center; padding:16px;
          color: var(--secondary-text-color); font-size:13px;
        }
      </style>

      <div class="row">
        <label>Naam (optioneel)</label>
        <ha-textfield id="cardName" placeholder="Bijv. Afvalwijzer"></ha-textfield>
      </div>

      <div class="items-header">
        <label>Afvaltypes</label>
      </div>
      <div id="itemsList"></div>

      <div class="add-section">
        <div class="add-row">
          <select id="addType"></select>
          <ha-entity-picker id="addEntity" allow-custom-entity></ha-entity-picker>
        </div>
        <button class="add-btn" id="addBtn">+ Toevoegen</button>
      </div>
    `;

    // Name field
    const nameField = this.shadowRoot.getElementById("cardName");
    nameField.value = this._config.name || "";
    nameField.addEventListener("change", (ev) => {
      this._config = { ...this._config, name: ev.target.value };
      this._fireChanged();
    });

    // Add entity picker
    const addEntity = this.shadowRoot.getElementById("addEntity");
    addEntity.hass = this._hass;
    addEntity.includeDomains = ["sensor"];
    addEntity.value = "";

    // Populate type dropdown
    this._populateTypeDropdown();

    // Auto-suggest entity when type changes
    const addType = this.shadowRoot.getElementById("addType");
    addType.addEventListener("change", () => {
      const type = addType.value;
      if (type) {
        // Suggest entity name
        addEntity.value = `sensor.mijnafvalwijzer_${type}`;
      }
    });
    // Trigger initial suggestion
    if (addType.value) {
      addEntity.value = `sensor.mijnafvalwijzer_${addType.value}`;
    }

    // Add button
    this.shadowRoot.getElementById("addBtn").addEventListener("click", () => {
      const type = addType.value;
      const entity = addEntity.value;
      if (!type || !entity) return;

      const items = [...(this._config.items || [])];
      items.push({ type, entity });
      this._config = { ...this._config, items };
      this._fireChanged();
      this._renderItems();
      this._populateTypeDropdown();
      addEntity.value = "";
    });

    this._rendered = true;
    this._renderItems();
  }

  _populateTypeDropdown() {
    const select = this.shadowRoot.getElementById("addType");
    const usedTypes = (this._config.items || []).map((i) => i.type);
    const available = Object.keys(WASTE_TYPES).filter((t) => !usedTypes.includes(t));

    select.innerHTML = available.length
      ? available.map((t) => `<option value="${t}">${WASTE_TYPES[t].name}</option>`).join("")
      : `<option value="">Alle types toegevoegd</option>`;

    const addBtn = this.shadowRoot.getElementById("addBtn");
    if (addBtn) addBtn.disabled = available.length === 0;

    // Auto-suggest entity for first available type
    const addEntity = this.shadowRoot.getElementById("addEntity");
    if (addEntity && available.length > 0) {
      addEntity.value = `sensor.mijnafvalwijzer_${available[0]}`;
    }
  }

  _renderItems() {
    const list = this.shadowRoot.getElementById("itemsList");
    const items = this._config.items || [];

    if (items.length === 0) {
      list.innerHTML = `<div class="empty-msg">Nog geen afvaltypes toegevoegd</div>`;
      return;
    }

    list.innerHTML = items
      .map((item, idx) => {
        const def = WASTE_TYPES[item.type] || { name: item.type, color: "#888" };
        return `
          <div class="item-row">
            <div class="item-dot" style="background:${def.color};"></div>
            <div class="item-info">
              <span class="item-type-name">${def.name}</span>
              <span class="item-entity">${item.entity}</span>
            </div>
            <button class="item-remove" data-idx="${idx}" title="Verwijderen">✕</button>
          </div>
        `;
      })
      .join("");

    // Wire remove buttons
    list.querySelectorAll(".item-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.dataset.idx);
        const items = [...(this._config.items || [])];
        items.splice(idx, 1);
        this._config = { ...this._config, items };
        this._fireChanged();
        this._renderItems();
        this._populateTypeDropdown();
      });
    });
  }

  _fireChanged() {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }
}
customElements.define("ultimate-waste-card-editor", UltimateWasteCardEditor);

/* ============================================================
   MAIN CARD
   ============================================================ */
class UltimateWasteCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
  }

  static getConfigElement() {
    return document.createElement("ultimate-waste-card-editor");
  }

  static getStubConfig() {
    return { name: "", items: [] };
  }

  setConfig(config) {
    this._config = { items: [], ...config };
    this._buildStructure();
    if (this._hass) this._update();
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  getCardSize() {
    return 2;
  }

  /* --- Build DOM once --- */
  _buildStructure() {
    const items = this._config.items || [];

    this.shadowRoot.innerHTML = `
      <div class="aw" id="container">
        ${items.map((item, idx) => {
          const def = WASTE_TYPES[item.type] || { name: item.type, icon: "mdi:help-circle", color: "#888" };
          return `
            <div class="chip" id="chip-${idx}" data-entity="${item.entity}">
              <div class="ci" style="background:${def.color};">
                <ha-icon icon="${def.icon}" style="--mdc-icon-size:20px;color:#fff;display:flex;"></ha-icon>
              </div>
              <div class="cf">
                <span class="cn">${def.name}</span>
                <span class="cd" id="date-${idx}">--</span>
              </div>
            </div>
          `;
        }).join("")}
      </div>
      ${this._styles()}
    `;

    // Wire click handlers once
    items.forEach((item, idx) => {
      const chip = this.shadowRoot.getElementById(`chip-${idx}`);
      if (chip) {
        chip.addEventListener("click", () => {
          const evt = new CustomEvent("hass-more-info", {
            detail: { entityId: item.entity },
            bubbles: true,
            composed: true,
          });
          const ha = document.querySelector("home-assistant");
          if (ha) ha.dispatchEvent(evt);
        });
      }
    });
  }

  _styles() {
    return `<style>
      :host { display:block; }
      .aw {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .chip {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 12px 8px;
        border-radius: 28px;
        cursor: pointer;
        transition: background .15s;
        background: none;
        overflow: visible;
        backdrop-filter: blur(3px) saturate(120%);
        -webkit-backdrop-filter: blur(3px) saturate(120%);
        box-shadow:
          inset 0 1px 2px rgba(255,255,255,.35),
          inset 0 2px 4px rgba(0,0,0,.15),
          0 2px 6px rgba(0,0,0,.45);
      }
      .chip:hover { background: rgba(255,255,255,.08); }
      .chip.chip-today {
        box-shadow:
          inset 0 1px 2px rgba(255,255,255,.35),
          inset 0 2px 4px rgba(0,0,0,.15),
          0 2px 6px rgba(0,0,0,.45),
          0 0 0 2px rgba(2,111,161,0.7);
      }
      .chip.chip-tomorrow {
        box-shadow:
          inset 0 1px 2px rgba(255,255,255,.35),
          inset 0 2px 4px rgba(0,0,0,.15),
          0 2px 6px rgba(0,0,0,.45),
          0 0 0 2px rgba(255,152,0,0.5);
      }
      .ci {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .cf {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 0;
      }
      .cn {
        font-size: 12px;
        font-weight: 700;
        color: rgba(255,255,255,0.92);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        font-family: var(--primary-font-family, sans-serif);
      }
      .cd {
        font-size: 11px;
        font-weight: 600;
        color: rgba(255,255,255,0.45);
        white-space: nowrap;
        font-family: var(--primary-font-family, sans-serif);
      }
      .cd-today {
        color: #026FA1;
        font-weight: 800;
      }
      .cd-tomorrow {
        color: #FF9800;
        font-weight: 800;
      }
    </style>`;
  }

  /* --- Update values only --- */
  _update() {
    if (!this._hass) return;
    const items = this._config.items || [];

    // Get today and tomorrow as dd-mm-yyyy
    const now = new Date();
    const today = this._formatDate(now);
    const tom = new Date(now);
    tom.setDate(tom.getDate() + 1);
    const tomorrow = this._formatDate(tom);

    items.forEach((item, idx) => {
      const dateEl = this.shadowRoot.getElementById(`date-${idx}`);
      const chipEl = this.shadowRoot.getElementById(`chip-${idx}`);
      if (!dateEl || !chipEl) return;

      const stateObj = this._hass.states[item.entity];
      const datum = stateObj ? stateObj.state : "";

      // Reset classes
      chipEl.classList.remove("chip-today", "chip-tomorrow");
      dateEl.classList.remove("cd-today", "cd-tomorrow");

      if (!datum || datum === "unknown" || datum === "unavailable") {
        dateEl.textContent = "Onbekend";
      } else if (datum === today) {
        dateEl.textContent = "Vandaag";
        dateEl.classList.add("cd-today");
        chipEl.classList.add("chip-today");
      } else if (datum === tomorrow) {
        dateEl.textContent = "Morgen";
        dateEl.classList.add("cd-tomorrow");
        chipEl.classList.add("chip-tomorrow");
      } else {
        dateEl.textContent = datum;
      }
    });
  }

  _formatDate(d) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }
}

customElements.define("ultimate-waste-card", UltimateWasteCard);

/* ============================================================
   REGISTER WITH HA
   ============================================================ */
window.customCards = window.customCards || [];
window.customCards.push({
  type: "ultimate-waste-card",
  name: "Ultimate Waste Card",
  description:
    "Een stijlvolle afvalkaart die ophaaldatums toont als glasstijl-chips met automatische vandaag/morgen detectie.",
  preview: true,
  documentationURL: "https://github.com/Sven2410/ultimate-waste-card",
});

console.info(
  "%c ULTIMATE-WASTE-CARD %c v1.0.0 ",
  "color:#fff;background:#4CAF50;font-weight:bold;padding:2px 6px;border-radius:4px 0 0 4px;",
  "color:#4CAF50;background:#f0f0f0;font-weight:bold;padding:2px 6px;border-radius:0 4px 4px 0;"
);
