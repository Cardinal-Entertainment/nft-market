const fs = require("fs");

function parseContract(contractName) {
  const contract = fs.readFileSync(`./src/contracts/${contractName}`);
  const contractJson = JSON.parse(contract);

  const abi = contractJson.abi;

  let functionNames = "";
  let eventNames = "";

  for (let i = 0; i < abi.length; i++) {
    const abiObject = abi[i];

    if (abiObject.type === "function") {
      functionNames += `- ${abiObject.name}\n`;
    } else if (abiObject.type === "event") {
      eventNames += `- ${abiObject.name}\n`;
    }
  }

  const markdownContent = `
# ${contractName.replace('.json', '')} Contract \n
## Functions \n
${functionNames}\n
## Events \n
${eventNames}\n
            `;

  fs.writeFile(`${contractName.replace('.json', '')}.md`, markdownContent, function (err) {
    if (err) throw err;
    console.log("File is created successfully.");
  });
}

const args = process.argv.slice(2);
const contractName = args[0];

if (contractName) {
  parseContract(contractName);
} else {
  const contractDir = "./src/contracts/";

  fs.readdir(contractDir, (err, files) => {
    files.forEach((file) => {
      parseContract(file);
    });
  });
}
