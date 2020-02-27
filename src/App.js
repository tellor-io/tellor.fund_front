import React, { Component } from "react";
import TellorFund from "./contracts/TellorFund.json";
import Tellor from "./contracts/Tellor.json";
import getWeb3 from "./getWeb3";
import {openProposalsTable} from "./components/openProposalsTable"
import myProposalsTable from "./components/myProposalsTable"
import "./App.css";
import {
  EmailIcon,
  TelegramIcon,
  TwitterIcon
} from "react-share";

const contractAddress ="0x72F24506bad04B64BE1bb9332F0DEA5C5d519630"//"0x7d67E614d92b9D070839954dfd82ceEc7daFDAeD";
console.log(contractAddress);


class App extends Component {


  state = { web3: null,
            accounts: null,
            contract: null,
            openTable: null,
            myTable: null, 
            price: 0,
            contractAddress:contractAddress,
            tellorAddress:"",
            tellorInstance:null,
            availableBalance: 0,
            fundID:0,
            fundAmount:0,
            closeID:0
           };


  componentDidMount = async () => {
    this.handleCloseSubmit = this.handleCloseSubmit.bind(this);
    this.handleWithdrawSubmit = this.handleWithdrawSubmit.bind(this);
    this.handleFundSubmit = this.handleFundSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const instance = await new web3.eth.Contract(TellorFund.abi,this.state.contractAddress);
      const availableBalance = web3.utils.fromWei(await instance.methods.getAvailableForWithdraw(accounts[0]).call());
      const price = await instance.methods.viewTellorPrice().call();
      const tellorAddress = await instance.methods.tellorAddress().call()
      const tellorInstance = await new web3.eth.Contract(Tellor.abi,tellorAddress);
      const openTable = await openProposalsTable(instance);
      const myTable = await myProposalsTable(instance,accounts[0]);
      await this.setState({web3,accounts,openTable,myTable,availableBalance,price,tellorAddress,tellorInstance,contract:instance})
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }

  };


  handleChange(e,target) {
    let change = {}
    change[e.target.name] = e.target.value
    console.log("changing",e.target)
    this.setState(change)
  }
  handleCloseSubmit(event) {
    this.state.contract.methods.closeProposal(this.state.closeID).send({
          from: this.state.accounts[0],
          to: contractAddress,
          value:0,
          gasPrice: '20000000000' 
        }).then(function(res){
          console.log("response: ", res)
    });
  }
  handleWithdrawSubmit(event) {
    this.state.contract.methods.withdrawMoney().send({
          from: this.state.accounts[0],
          to: contractAddress,
          value:0,
          gasPrice: '20000000000' 
        }).then(function(res){
          console.log("response: ", res)
    });
  }
  handleFundSubmit(event) {
   this.state.tellorInstance.methods.approve(contractAddress,this.state.web3.utils.toWei(this.state.fundAmount)).send({
          from: this.state.accounts[0],
          to:this.state.tellorInstance._address,
          value:0,
          gasPrice: '20000000000' 
   }).once('receipt', (receipt) =>{
      console.log("approved",receipt)
      console.log("funding",this.state.fundID,this.state.fundAmount)
      this.state.contract.methods.fund(this.state.fundID,this.state.web3.utils.toWei(this.state.fundAmount)).send({
          from: this.state.accounts[0],
          to: contractAddress,
          value:0,
          gasPrice: '20000000000' 
        }).then(function(res){
          console.log("response: ", res)
      });
    })
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading tellor.fund</div>;
    }
    return (
      <div className="App">
        <div className="HeaderContainer">
          <div className="Header">
            <div className="innerHeader">
               <h1 className="HText">
               <img className="Swoosh" src="./WhiteSwoosh.png" alt="TellorSwoosh"></img> 
               tellor.fund
               </h1>
            </div>
          </div>
        </div>
        <div className="PriceContainer">
          <div className ="Price">
            <h3> trb price : ${this.state.price} </h3>
          </div>
        </div>
        <div className="OpenTableContainer">
          <div className="MyTable">
          <div className="inner">
              {this.state.openTable}
            </div>
          </div>
        </div>
        <div className="FormContainer">
            <div className="ButtonContainer">
              <div className="Button">
                <button onClick={this.handleFundSubmit}>fund</button>
                  <input type="number" placeholder="Proposal ID" name="fundID" onChange={this.handleChange}/>
                  <input type="number" placeholder="Amount TRB" name="fundAmount" onChange={this.handleChange}/>
              </div>
              <div className="Button">
                  <button onClick={this.handleCloseSubmit}>close</button>
                  <input type="number" name="closeID" placeholder="Proposal ID" onChange={this.handleChange}/>
              </div>
              <div className="Button"> 
                  <p><button onClick={this.handleWithdrawSubmit}>withdraw</button> {'\u00A0'} {this.state.availableBalance} TRB</p>
              </div>
              </div>
          </div>
        <div className="OpenTableContainer">
            <div className="MyTable">
              <div className="inner">
              {this.state.myTable}
            </div>
          </div>
        </div>
        <div className="SocialContainer">
          <div className="Social">
            <a href="https://twitter.com/wearetellor">
              <TwitterIcon size={32} round={true} />
            </a>
            <a href="https://t.me/tellorchannel">
              <TelegramIcon size={32} round={true} />
            </a>
            <a href="malito:info@tellor.io">
              <EmailIcon size={32} round={true} />
            </a>
        </div>
       </div>
    </div>
    );
  }
}

export default App;
