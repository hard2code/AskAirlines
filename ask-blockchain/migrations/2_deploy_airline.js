const Airlines = artifacts.require("Airlines");

module.exports = function(deployer) {
  deployer.deploy(Airlines,100); // 100 is the token initial supply
};
