require("dotenv").config();
const fs = require("fs");
const {
    Client, TopicCreateTransaction, TopicMessageSubmitTransaction,
    ContractExecuteTransaction, ContractFunctionParameters, AccountId
} = require("@hashgraph/sdk");
const crypto = require("crypto");

const client = Client.forTestnet();
client.setOperator(process.env.MY_ACCOUNT_ID, process.env.MY_PRIVATE_KEY);
const myAddress = AccountId.fromString(process.env.MY_ACCOUNT_ID).toSolidityAddress();

async function main() {
    // 1. LOAD CONFIG FROM DEPLOYMENT
    let config;
    try {
        const rawConfig = fs.readFileSync("hedera_config.json");
        config = JSON.parse(rawConfig);
        console.log(`✅ Loaded Contract ID: ${config.contractId}`);
    } catch (e) {
        console.error("❌ ERROR: Run 'node deploy.js' first!");
        process.exit(1);
    }

    // 2. CREATE TOPIC
    console.log("🏭 BOOTING SENSOR NETWORK...");
    const tx = await new TopicCreateTransaction().execute(client);
    const receipt = await tx.getReceipt(client);
    const topicId = receipt.topicId;
    console.log(`✅ NEW TOPIC ID: ${topicId.toString()}`);

    // 3. WRITE UI CONFIG FILE (This is what index.html reads)
    const uiConfig = `
        window.HEDERA_CONFIG = {
            topicId: "${topicId.toString()}",
            contractId: "${config.contractId}",
            tokenId: "${config.tokenId}"
        };
    `;
    fs.writeFileSync("auto_config.js", uiConfig);
    console.log("💾 UI AUTOMATION: Updated 'auto_config.js'");

    // 4. START STREAM
    let counter = 200;
    setInterval(async () => {
        counter++;
        const rand = Math.random();
        let temp;
        
        if (rand < 0.15) temp = (Math.random() * 3).toFixed(1); 
        else if (rand < 0.8) temp = (4.0 + Math.random() * 0.9).toFixed(1); 
        else temp = (5.0 + Math.random() * 3).toFixed(1); 

        const batchId = `BATCH_${counter}`;
        const dataObj = { id: batchId, temp: temp, status: "ACTIVE" };
        const jsonString = JSON.stringify(dataObj);
        const hash = crypto.createHash("sha256").update(jsonString).digest("hex");
        const message = `${jsonString}||${hash}`;

        try {
            process.stdout.write(`\r[${new Date().toLocaleTimeString()}] 📡 Sending ${batchId} (${temp}°C)... `);
            
            await new TopicMessageSubmitTransaction()
                .setTopicId(topicId)
                .setMessage(message)
                .execute(client);

            if (parseFloat(temp) >= 4.0 && parseFloat(temp) < 5.0) {
                 new ContractExecuteTransaction()
                    .setContractId(config.contractId)
                    .setGas(200000)
                    .setFunction("verifyAndReward", 
                        new ContractFunctionParameters().addString(hash).addAddress(myAddress)
                    ).execute(client)
                    .catch(e => {}); 
            }
        } catch (e) { console.log("⚠️ Network Busy"); }
    }, 3500);
}

main();