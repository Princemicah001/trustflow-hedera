require("dotenv").config();
const fs = require("fs");
const csv = require("csv-parser");
const crypto = require("crypto");
const {
    Client, TopicCreateTransaction, TopicMessageSubmitTransaction,
    TopicMessageQuery, ContractExecuteTransaction, ContractFunctionParameters,
    AccountId
} = require("@hashgraph/sdk");

// *** 🟢 PASTE YOUR CONTRACT ID HERE 🟢 ***
const MY_CONTRACT_ID = "0.0.7301709"; 
// *****************************************

const client = Client.forTestnet();
client.setOperator(process.env.MY_ACCOUNT_ID, process.env.MY_PRIVATE_KEY);
const myAddress = AccountId.fromString(process.env.MY_ACCOUNT_ID).toSolidityAddress();

async function main() {
    console.log("🚀 STARTING HEDERA ANALYTICS & SUPPLY CHAIN SIMULATION...\n");

    // 1. Setup the "Trust Channel" (HCS Topic)
    console.log("--- [STEP 1] Setting up Secure Data Channel ---");
    const topicTx = await new TopicCreateTransaction().execute(client);
    const topicReceipt = await topicTx.getReceipt(client);
    const topicId = topicReceipt.topicId;
    console.log(`✅ HCS Topic Created: ${topicId}\n`);

    // 2. Start the "Analytics Dashboard" (The Listener)
    // In the real world, this would be a separate React App or PowerBI plugin.
    console.log("--- [STEP 2] Booting up Real-Time Analytics Dashboard ---");
    console.log("📊 Dashboard is now listening for immutable data...\n");
    
    new TopicMessageQuery()
        .setTopicId(topicId)
        .subscribe(client, null, (message) => {
            const msgString = Buffer.from(message.contents, "utf8").toString();
            const time = message.consensusTimestamp.toDate().toLocaleTimeString();
            console.log(`   [📊 DASHBOARD CHECK] 🔍 Verified Record: ${msgString} at ${time}`);
        });

    // 3. Start the "Legacy Ingestion" (Reading CSV)
    console.log("--- [STEP 3] Ingesting Legacy Data from 'supply_chain.csv' ---");
    const rows = [];
    
    // Helper to process rows sequentially
    const processRows = async () => {
        for (const row of rows) {
            console.log(`\n📥 Processing Batch: ${row.BatchID} (${row.Product})...`);

            // A. Create Hash (Privacy Protection)
            const rowString = JSON.stringify(row);
            const hash = crypto.createHash("sha256").update(rowString).digest("hex").substring(0, 10); // Short hash for display

            // B. Submit to Hedera (The Trust Layer)
            const submitTx = await new TopicMessageSubmitTransaction()
                .setTopicId(topicId)
                .setMessage(`${row.BatchID}|HASH:${hash}|STATUS:${row.Status}`)
                .execute(client);
            await submitTx.getReceipt(client); // Wait for consensus

            // C. Smart Contract Action (The Incentive)
            if (row.Status === "OK") {
                console.log("   🤖 Status is OK. Triggering Smart Contract Payout...");
                try {
                    const contractTx = await new ContractExecuteTransaction()
                        .setContractId(MY_CONTRACT_ID)
                        .setGas(2000000) 
                        .setFunction(
                            "verifyAndReward", 
                            new ContractFunctionParameters()
                                .addString(hash)
                                .addAddress(myAddress)
                        )
                        .execute(client);
                    await contractTx.getReceipt(client);
                    console.log("   💰 REWARD SENT: 10.00 TRUST Tokens minted to your wallet.");
                } catch (e) {
                    console.log("   ⚠️ Contract Error: " + e.message);
                }
            } else {
                console.log("   ⚠️ Status is WARNING. No reward issued for this batch.");
            }
            
            // Wait a moment to let the Dashboard logs appear clearly
            await new Promise(r => setTimeout(r, 4000));
        }
        console.log("\n✅ SIMULATION COMPLETE. You have demonstrated Secure Data Analytics!");
        process.exit(0);
    };

    // Read File and Start
    fs.createReadStream("supply_chain.csv")
        .pipe(csv())
        .on("data", (data) => rows.push(data))
        .on("end", processRows);
}

main().catch(console.error);