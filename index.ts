import { parseAbi } from "npm:abitype@0.9.8";
import { createPublicClient, createTestClient, http, getContract } from "npm:viem@1.10.14";
import { mainnet } from "npm:viem@1.10.14/chains";

const RPC_URL = "http://127.0.0.1:8888";
const norAddress = "0x55032650b14df07b85bF18A3a3eC8E0Af2e028d5";
const operatorId = 1n;
const storage_total =
  "0xe2a589ae0816b289a9d29b7c085f8eba4b5525accca9fa8ff4dba3f5a41287e8";
const storage_active =
  "0x6f5220989faafdc182d508d697678366f4e831f5f56166ad69bfc253fc548fb1";
const operators_total =
  "0x0000000000000000000000000000000000000000000000000000000000000002";
const operators_active = operators_total;
const operators_keys_packed =
  "0x000000000000000a000000000000000a0000000000000000000000000000000a";
const target_validators_packed =
  "0x0000000000000000000000000000000a00000000000000000000000000000000";
const nodeOperatorsSlot2 =
  "0xada5013122d395ba3c54772283fb069b10426056ef8ca54750cb9bb552a59e7f";
const nodeOperatorsSlot4 =
  "0xada5013122d395ba3c54772283fb069b10426056ef8ca54750cb9bb552a59e81";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(RPC_URL),
});

const testClient = createTestClient({
  chain: mainnet,
  transport: http(RPC_URL),
  mode: "hardhat",
});

const abi = parseAbi([
  "function getNodeOperator(uint256,bool) view returns(bool,string,address,uint64,uint64,uint64,uint64)",
  "function getNodeOperatorsCount() view returns (uint256)",
  "function getActiveNodeOperatorsCount() view returns (uint256)",
  "function getNodeOperatorSummary(uint256) view returns (bool,uint64,uint64,uint64,uint64,uint64,uint64,uint64)",
]);

const contract = getContract({
  abi,
  publicClient,
  address: norAddress,
});

const log = async () => {
  const state = await contract.read.getNodeOperator([operatorId, false]);
  const count = await contract.read.getNodeOperatorsCount();
  const activeCount = await contract.read.getActiveNodeOperatorsCount();
  const summary = await contract.read.getNodeOperatorSummary([operatorId]);

  console.log({ state, count, activeCount, summary });
};

(async () => {
  console.log("Initial state");
  console.log("=========================================================");
  console.log("=========================================================");
  console.log("=========================================================");

  await log();

  await testClient.setStorageAt({
    address: norAddress,
    index: storage_total,
    value: operators_total,
  });

  await testClient.setStorageAt({
    address: norAddress,
    index: storage_active,
    value: operators_active,
  });

  await testClient.setStorageAt({
    address: norAddress,
    index: nodeOperatorsSlot2,
    value: operators_keys_packed,
  });

  await testClient.setStorageAt({
    address: norAddress,
    index: nodeOperatorsSlot4,
    value: target_validators_packed,
  });

  console.log("State after manipulation");
  console.log("=========================================================");
  console.log("=========================================================");
  console.log("=========================================================");

  await log();
})();
