# 🛡️ TrustFlow: Hedera Forensic Audit Suite

### *Verifiable Supply Chain Integrity on the Hedera Hashgraph*

**TrustFlow** is an enterprise-grade forensic auditing platform that
integrates legacy IoT systems with **Hedera Distributed Ledger
Technology (DLT)**. It provides real-time, tamper-proof validation of
sensor data, automates compliance checks, and introduces programmable
incentive mechanisms to strengthen supply chain integrity.

## 🚨 Overview

Many industries---pharmaceutical cold chains, food logistics, and
high-value manufacturing---rely on sensor data that passes through
internal personnel and centralized databases. This creates opportunities
for **insider manipulation**, where records can be altered to hide
spoilage, bypass penalties, or distort analytics dashboards.

**TrustFlow eliminates this single point of failure** by validating
every data packet against Hedera's public consensus and enforcing
automated smart-contract logic around compliance and incentives.

## 🧩 Architecture

### 1. Immutable Sensor Logging (HCS)

Every IoT data packet is hashed and its fingerprint is submitted to the
**Hedera Consensus Service** immediately upon arrival.

### 2. Forensic Verification Engine

The dashboard compares each incoming record against the corresponding
HCS hash. Tampering triggers red alerts and quarantines evidence.

### 3. Smart Contract Enforcement

A Solidity contract automates: - Rewards for valid data - Penalties for
tampering - Compliance-state logging

### 4. Tokenized Incentives (HTS)

A native HTS token---**TRUST Token**---represents compliance credit.

## 🛠️ Tech Stack

-   **DLT:** Hedera (HCS, HTS, HSCS)
-   **Backend:** Node.js, @hashgraph/sdk
-   **Smart Contracts:** Solidity (EVM)
-   **Frontend:** HTML5, TailwindCSS, Chart.js

## 🚀 Installation & Usage

### 1. Prerequisites

-   Node.js v16+
-   Hedera Testnet Account

### 2. Clone Repository

``` bash
git clone https://github.com/Princemicah001/trustflow-hedera.git
cd trustflow-hedera
npm install
```

### 3. Environment Setup

Create `.env`:

    MY_ACCOUNT_ID=0.0.xxxx
    MY_PRIVATE_KEY=302e...

### 4. Deploy Contract + Token

``` bash
node deploy.js
```

### 5. Start Sensor Producer

``` bash
node producer.js
```

### 6. Launch Dashboard

Open `index.html` in your browser.

## 🎮 Demonstration

1.  Monitor live telemetry
2.  Observe token rewards
3.  Simulate tampering via:

```{=html}
<!-- -->
```
    fix

4.  View red alerts and slashed tokens
5.  Export forensic CSV

## 📄 License

MIT
