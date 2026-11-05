# PRECIMETAL™ INDUSTRIAL OS
### Precision Metal Weight & Component Costing Engine

An advanced, browser-native industrial engineering and production costing platform designed for precision turned components manufacturers, brass extrusion workshops, CNC turning centers, and machine shops.

Deployable directly on **GitHub Pages**, zero external dependencies, 100% offline-first capability, and retina-crisp real-time visual telemetry.

---

## 📐 Mathematical Model & Formula Reference

The application is engineered strictly in conformance with verified industrial metal costing spreadsheets (standard in precision turned parts manufacturing hubs like Jamnagar):

### 1. Geometry Theoretical Weight per Piece ($W$)

$$\text{Weight (grams)} = \text{Rod}^2 \times (\text{Length} + 4.0) \times C_{\text{geom}}$$

| Metal Geometry | Section Profile | Conversion Coefficient ($C_{\text{geom}}$) | Reference Formula |
| :--- | :--- | :---: | :--- |
| **Round Rod** | Cylindrical Turning | `0.006676` | $\text{Rod}^2 \times (\text{Length} + 4) \times 0.006676$ |
| **Square Bar** | Square Billet | `0.007361` | $\text{Rod}^2 \times (\text{Length} + 4) \times 0.007361$ |
| **Hexagon (HEX)** | Hexagonal Across Flats | `0.008500` | $\text{Rod}^2 \times (\text{Length} + 4) \times 0.008500$ |

> **Note:** Fixed length allowance of $+4.0\text{ mm}$ accounts for standard parting-off tool width and facing clean-up margin. This is fully customizable in **Settings**.

---

### 2. Market Rates & Surcharge Derivation

- **Honey**: Daily metal scrap / benchmark market index (₹/kg)
- **Raw Metal Purchase Rate (Rod)**:
  $$\text{Rod Rate} = \text{Honey} + ₹21.00$$
- **Scrap / Wastage Selling Rate (Chhol)**:
  $$\text{Scrap Rate} = \text{Honey} \times (1 - 0.05) = \text{Honey} - 5\%$$

---

### 3. Production Consumption, Wastage & Costing

- **Wastage (Chhol) Weight**:
  $$\text{Wastage Weight (g)} = \text{Material Weight} - \text{Actual Product Weight}$$
- **Gross Raw Material Purchased Cost**:
  $$\text{Raw Material Cost (₹)} = \frac{\text{Material Weight (g)} \times \text{Rod Rate (₹/kg)}}{1000}$$
- **Scrap Recovery Credit (Chhol Value)**:
  $$\text{Scrap Recovery (₹)} = \frac{\text{Wastage Weight (g)} \times \text{Scrap Rate (₹/kg)}}{1000}$$
- **Net Metal Cost (Material Rs.)**:
  $$\text{Material Rs.} = \text{Raw Material Cost} - \text{Scrap Recovery}$$
- **Total Production Cost (Padtar Rs.)**:
  $$\text{Padtar Rs.} = \text{Material Rs.} + \text{Majuri (Labour Charges)}$$
- **Target Profit Amount**:
  $$\text{Profit (₹)} = \text{Padtar} \times \frac{\text{Profit } \%}{100}$$
- **Final Product Selling Price**:
  $$\text{Final Selling Price (₹)} = \text{Padtar} + \text{Profit}$$

---

## 🧪 Benchmark Verification (Factory Test Case A-1)

| Parameter | Input / Condition | Formula / Cell | Benchmark Output | PRECIMETAL Output |
| :--- | :--- | :--- | :---: | :---: |
| **Geometry** | Round | — | Round | **Round** |
| **Rod Dimension** | 10.70 mm | C6 | 10.70 | **10.70 mm** |
| **Length** | 8.80 mm | C7 | 8.80 | **8.80 mm** |
| **Expected Weight** | Round Formula | $10.7^2 \times (8.8 + 4) \times 0.006676$ | **9.78 g** | **9.78 g** |
| **Honey Market Rate**| ₹870.00 / kg | C12 | ₹870.00 | **₹870.00** |
| **Rod Purchase Rate**| Honey + ₹35 | C12 + 35 | **₹905.00** | **₹905.00** |
| **Scrap Rate (Chhol)**| Honey - 5% | C12 * 0.95 | **₹826.50** | **₹826.50** |
| **Actual Part Weight**| Weighed Piece | C19 | 4.20 g | **4.20 g** |
| **Wastage (Chhol)** | Expected - Actual | C18 - C19 | **5.58 g** | **5.58 g** |
| **Gross Material Cost**| $(9.78 \times 905) / 1000$ | E18 | **₹8.85** | **₹8.85** |
| **Scrap Recovery** | $(5.58 \times 826.5) / 1000$| E20 | **₹4.61** | **₹4.61** |
| **Material Rs.** | Gross - Scrap | E18 - E20 | **₹4.24** | **₹4.24** |
| **Labour (Majuri)** | Default Rate | E23 | ₹0.35 | **₹0.35** |
| **Padtar (Cost Price)**| Material + Majuri | SUM(E22:E23) | **₹4.59** | **₹4.59** |
| **Profit Margin** | 15% | B25 | 15.0% | **15.0%** |
| **Profit Amount** | Padtar × 15% | E24 * B25 / 100 | **₹0.69** | **₹0.69** |
| **Final Selling Price**| Padtar + Profit | E24 + E25 | **₹5.28** | **₹5.28** |

*All outputs match the factory spreadsheet to the exact decimal.*

---

## 🚀 Key Features

1. **Dual Operating Modes**:
   - **Guided 3-Step Wizard**: Perfect for shop operators and estimators moving step-by-step through Geometry $\rightarrow$ Market Rates $\rightarrow$ Production Costing.
   - **Full Industrial Workbench**: Shows all stages simultaneously for high-throughput quotation drafting.
2. **Visual Data Telemetry**:
   - Pure HTML5 Canvas Retina renderers: Cost Donut Chart (Net Metal vs. Labour vs. Profit) and Semi-Circular Material Utilization Gauge.
   - Dynamic segmented visual progress bar tracking part weight vs. scrap generation.
3. **Batch Production Simulator**:
   - Project order metrics for 100, 500, 1,000, 5,000, 10,000 or custom piece counts:
     * Total raw rod required in kg
     * Total scrap swarf generated in kg
     * Total lot profit (₹)
     * Total order quotation (₹)
4. **Physical Anomaly Detection**:
   - Live guard warns operators if actual measured piece weight exceeds the theoretical raw material piece weight.
5. **Printable Work Order & Quotation Sheet**:
   - One-click print-ready technical document with item specifications, breakdown table, batch projection, and operator/manager signature lines.
6. **Local Persistence & Data Management**:
   - Save calculations to history, search records, load past jobs, export directly to **CSV (Excel format)**, and export/import full **JSON backups**.
7. **Comprehensive Settings & Calibration**:
   - Change default Majuri (labour), target profit %, raw rod purchase markup (+₹35 default), scrap discount (-5% default), fixed parting allowance (+4 mm default), and geometry conversion coefficients.
   - Material density presets for Brass, Copper, Mild Steel, Stainless Steel, and Aluminium.

---

## 💻 Quick Start & Running Locally

Because PRECIMETAL is built using standard HTML5, CSS3, and modern vanilla JavaScript:

1. Simply double-click `index.html` to open it in any web browser (Chrome, Edge, Firefox, Safari).
2. Alternatively, start a lightweight local web server:
   ```bash
   python -m http.server 8000
   ```
   and visit `http://localhost:8000`.

---

## 🌐 Deploying to GitHub Pages

1. **Initialize Git & Commit**:
   ```bash
   git init
   git add .
   git commit -m "feat: complete PRECIMETAL Industrial OS with verified calculation engine"
   ```

2. **Link to your GitHub repository (`Legend-Parth`)**:
   ```bash
   git remote add origin https://github.com/Legend-Parth/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repository settings on GitHub: **Settings $\rightarrow$ Pages**.
   - Under **Build and deployment**, select **GitHub Actions** (the included `.github/workflows/deploy.yml` workflow will automatically build and publish the site).
   - Your application will be live at:
     ```
     https://legend-parth.github.io/<your-repo-name>/
     ```

---

## 📄 License
MIT License. Developed for industrial precision turned component manufacturing.
