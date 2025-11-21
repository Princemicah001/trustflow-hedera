require("dotenv").config();
const {
    Client, TopicCreateTransaction, TopicMessageSubmitTransaction, 
    ContractExecuteTransaction, ContractFunctionParameters, AccountId
} = require("@hashgraph/sdk");

// *** PASTE YOUR ID HERE ***
const MY_CONTRACT_ID = "0.0.7301708"; 
// **************************

const client = Client.forTestnet();
client.setOperator(process.env.MY_ACCOUNT_ID, process.env.MY_PRIVATE_KEY);

async function main() {
    // 1. Create an HCS Topic (The Data Stream)
    console.log("🌐 Creating Data Stream (HCS Topic)...");
    const topicTx = await new TopicCreateTransaction().execute(client);
    const topicReceipt = await topicTx.getReceipt(client);
    const topicId = topicReceipt.topicId;
    console.log(`   Topic Created: ${topicId}`);

    // 2. Simulate "Seamless Data Ingestion" from Legacy System
    const legacyData = { id: 101, value: 500, status: "valid" };
    console.log(`\n📥 Ingesting Legacy Data: ${JSON.stringify(legacyData)}`);
    
    // 3. Submit Hash to HCS (The Trust Layer)
    const message = `DATA_HASH_${Date.now()}`; // Simulating a hash
    console.log(`🔒 Stamping Logic: Sending '${message}' to Consensus Service...`);
    await new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(message)
        .execute(client);

    console.log("   ✅ Data Timestamped & Immutable.");

    // 4. Trigger Smart Contract (The Automation)
    console.log("\n🤖 Smart Contract Detected Valid Data. Executing Reward...");
    const myAddress = AccountId.fromString(process.env.MY_ACCOUNT_ID).toSolidityAddress();

    const contractTx = await new ContractExecuteTransaction()
        .setContractId(MY_CONTRACT_ID)
        .setGas(4000000) // Enough gas to mint & transfer
        .setFunction(
            "verifyAndReward", 
            new ContractFunctionParameters()
                .addString(message)  // Pass the data hash
                .addAddress(myAddress) // Send reward to ME
        )
        .execute(client);
    
    const record = await contractTx.getRecord(client);
    console.log(`   ✅ Contract Executed! Transaction Hash: ${contractTx.transactionId}`);
    
    console.log("\n💰 CHECK YOUR WALLET (HashPack)! You should have received 10.00 TRUST tokens.");
}

main().catch(console.error);