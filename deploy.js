require("dotenv").config();
const fs = require("fs");
const solc = require("solc");
const {
    Client, AccountId, PrivateKey, ContractCreateFlow, 
    TokenCreateTransaction, ContractExecuteTransaction, 
    ContractFunctionParameters, TokenAssociateTransaction,
    TokenType, TokenSupplyType
} = require("@hashgraph/sdk");

async function main() {
    const client = Client.forTestnet();
    client.setOperator(process.env.MY_ACCOUNT_ID, process.env.MY_PRIVATE_KEY);
    const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);

    console.log("1️⃣ Compiling Smart Contract...");
    const source = fs.readFileSync("TrustContract.sol", "utf8");
    const input = {
        language: "Solidity",
        sources: { "TrustContract.sol": { content: source } },
        settings: { outputSelection: { "*": { "*": ["*"] } } },
    };
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    const bytecode = output.contracts["TrustContract.sol"]["TrustContract"].evm.bytecode.object;

    console.log("2️⃣ Deploying Contract...");
    const contractTx = await new ContractCreateFlow()
        .setBytecode(bytecode)
        .setGas(1000000)
        .execute(client);
    const contractReceipt = await contractTx.getReceipt(client);
    const contractId = contractReceipt.contractId;
    const contractAddress = contractId.toSolidityAddress();
    console.log(`   ✅ Contract Deployed: ${contractId}`);

    console.log("3️⃣ Creating 'DataReward' Token...");
    const tokenTx = await new TokenCreateTransaction()
        .setTokenName("DataTrust Token")
        .setTokenSymbol("TRUST")
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(2)
        .setInitialSupply(0)
        .setTreasuryAccountId(operatorId)
        .setSupplyKey(contractId)
        .execute(client);
    
    const tokenReceipt = await tokenTx.getReceipt(client);
    const tokenId = tokenReceipt.tokenId;
    const tokenAddress = tokenId.toSolidityAddress();
    console.log(`   ✅ Token Created: ${tokenId}`);

    console.log("4️⃣ Linking Token to Contract...");
    await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("setTokenAddress", new ContractFunctionParameters().addAddress(tokenAddress))
        .execute(client);

    // --- AUTOMATION: SAVE CONFIG ---
    const config = {
        contractId: contractId.toString(),
        tokenId: tokenId.toString()
    };
    fs.writeFileSync("hedera_config.json", JSON.stringify(config, null, 2));
    console.log("\n💾 CONFIG SAVED: hedera_config.json");
}

main().catch(console.error);